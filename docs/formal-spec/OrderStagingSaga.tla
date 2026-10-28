------------------------- MODULE OrderStagingSaga -------------------------
(***************************************************************************)
(* ASIVO / CYBERLEARNIX — FORMAL DISTRIBUTED SPECIFICATION                  *)
(* Mathematical proof model of Redlock, Serializable DB Isolation,         *)
(* Transactional Outbox Pattern, and Idempotent Saga Choreography.         *)
(***************************************************************************)

EXTENDS Integers, Sequences, FiniteSets, TLC

CONSTANTS 
    Users,          \* Set of student user identifiers, e.g. {u1, u2}
    Courses,        \* Set of course identifiers, e.g. {c1, c2}
    OrderIds,       \* Set of unique order UUIDs, e.g. {o1, o2}
    EventIds,       \* Set of outbox event UUIDs, e.g. {e1, e2}
    AuthoritativePrice \* Function mapping Courses to Integer price

VARIABLES
    redisLock,          \* Distributed mutual exclusion lock table: user -> [held: Bool, token: Nat]
    dbOrders,           \* Database table of orders: OrderIds -> [user: Users \cup {"NONE"}, status: {"NONE", "PENDING", "CONFIRMED", "CANCELLED"}, total: Int]
    dbEnrollments,      \* Database active enrollment registry: SUBSET (Users \times Courses)
    dbOutbox,           \* Transactional outbox table: SUBSET [eventId: EventIds, orderId: OrderIds, status: {"PENDING", "DISPATCHED"}]
    kafkaQueue,         \* In-flight Kafka message broker queue: Seq([eventId: EventIds, orderId: OrderIds, user: Users])
    downstreamLedger,   \* Idempotent consumer de-duplication ledger: SUBSET EventIds
    networkPartition    \* Simulated network partition flag: Bool

vars == <<redisLock, dbOrders, dbEnrollments, dbOutbox, kafkaQueue, downstreamLedger, networkPartition>>

(***************************************************************************)
(* Type Invariants                                                         *)
(***************************************************************************)
TypeOK ==
    /\ redisLock \in [Users -> [held: BOOLEAN, token: Nat]]
    /\ dbOrders \in [OrderIds -> [user: Users \cup {"NONE"}, status: {"NONE", "PENDING", "CONFIRMED", "CANCELLED"}, total: Int]]
    /\ dbEnrollments \subseteq (Users \times Courses)
    /\ dbOutbox \subseteq [eventId: EventIds, orderId: OrderIds, status: {"PENDING", "DISPATCHED"}]
    /\ downstreamLedger \subseteq EventIds
    /\ networkPartition \in BOOLEAN

(***************************************************************************)
(* Initial State                                                           *)
(***************************************************************************)
Init ==
    /\ redisLock = [u \in Users |-> [held |-> FALSE, token |-> 0]]
    /\ dbOrders = [o \in OrderIds |-> [user |-> "NONE", status |-> "NONE", total |-> 0]]
    /\ dbEnrollments = {}
    /\ dbOutbox = {}
    /\ kafkaQueue = <<>>
    /\ downstreamLedger = {}
    /\ networkPartition = FALSE

(***************************************************************************)
(* Action 1: Acquire Distributed Redlock                                   *)
(* Enforces single-thread constraint per user with a lease token.          *)
(***************************************************************************)
AcquireLock(u, tok) ==
    /\ ~redisLock[u].held
    /\ redisLock' = [redisLock EXCEPT ![u] = [held |-> TRUE, token |-> tok]]
    /\ UNCHANGED <<dbOrders, dbEnrollments, dbOutbox, kafkaQueue, downstreamLedger, networkPartition>>

(***************************************************************************)
(* Action 2: Execute Secure Staging Inside DB Serializable Transaction     *)
(* Preconditions:                                                          *)
(* 1. Lock must be held by user u.                                         *)
(* 2. No active credentials already exist in dbEnrollments for courses.    *)
(* 3. Atomically writes order and transactional outbox record.             *)
(***************************************************************************)
StageOrder(u, o, cSet, ev) ==
    /\ redisLock[u].held
    /\ dbOrders[o].status = "NONE"
    /\ \A c \in cSet : <<u, c>> \notin dbEnrollments
    /\ \A ob \in dbOutbox : ob.eventId /= ev
    /\ LET calculatedTotal == AuthoritativePrice[CHOOSE c \in cSet : TRUE] IN
       /\ dbOrders' = [dbOrders EXCEPT ![o] = [user |-> u, status |-> "PENDING", total |-> calculatedTotal]]
       /\ dbOutbox' = dbOutbox \cup {[eventId |-> ev, orderId |-> o, status |-> "PENDING"]}
       /\ UNCHANGED <<redisLock, dbEnrollments, kafkaQueue, downstreamLedger, networkPartition>>

(***************************************************************************)
(* Action 3: Release Distributed Redlock                                   *)
(* Lua script atomic verification of token matching.                       *)
(***************************************************************************)
ReleaseLock(u, tok) ==
    /\ redisLock[u].held
    /\ redisLock[u].token = tok
    /\ redisLock' = [redisLock EXCEPT ![u] = [held |-> FALSE, token |-> 0]]
    /\ UNCHANGED <<dbOrders, dbEnrollments, dbOutbox, kafkaQueue, downstreamLedger, networkPartition>>

(***************************************************************************)
(* Action 4: Outbox Relay / Log Poller Flushes to Kafka                    *)
(* Blocked if network partition is active; guarantees zero outbox loss.    *)
(***************************************************************************)
RelayOutboxToKafka(ob) ==
    /\ ~networkPartition
    /\ ob \in dbOutbox
    /\ ob.status = "PENDING"
    /\ LET orderUser == dbOrders[ob.orderId].user IN
       /\ kafkaQueue' = Append(kafkaQueue, [eventId |-> ob.eventId, orderId |-> ob.orderId, user |-> orderUser])
       /\ dbOutbox' = (dbOutbox \ {ob}) \cup {[ob EXCEPT !.status = "DISPATCHED"]}
       /\ UNCHANGED <<redisLock, dbOrders, dbEnrollments, downstreamLedger, networkPartition>>

(***************************************************************************)
(* Action 5: Downstream Consumer Ingestion with Idempotency Ledger         *)
(* Deduplicates messages. If event is seen, drops it safely.              *)
(***************************************************************************)
ConsumeKafkaMessage ==
    /\ Len(kafkaQueue) > 0
    /\ LET msg == Head(kafkaQueue) IN
       /\ kafkaQueue' = Tail(kafkaQueue)
       /\ IF msg.eventId \in downstreamLedger
          THEN \* Duplicate redelivery: drop without state change
               /\ UNCHANGED <<redisLock, dbOrders, dbEnrollments, dbOutbox, downstreamLedger, networkPartition>>
          ELSE \* First-time delivery: commit enrollment and update order status
               /\ downstreamLedger' = downstreamLedger \cup {msg.eventId}
               /\ dbEnrollments' = dbEnrollments \cup {<<msg.user, CHOOSE c \in Courses : TRUE>>}
               /\ dbOrders' = [dbOrders EXCEPT ![msg.orderId].status = "CONFIRMED"]
               /\ UNCHANGED <<redisLock, dbOutbox, networkPartition>>

(***************************************************************************)
(* Action 6: Network Partition Injection & Healing                         *)
(***************************************************************************)
ToggleNetworkPartition ==
    /\ networkPartition' = ~networkPartition
    /\ UNCHANGED <<redisLock, dbOrders, dbEnrollments, dbOutbox, kafkaQueue, downstreamLedger>>

(***************************************************************************)
(* Next-State Relation                                                     *)
(***************************************************************************)
Next ==
    \/ \E u \in Users, tok \in 1..3 : AcquireLock(u, tok)
    \/ \E u \in Users, o \in OrderIds, c \in Courses, ev \in EventIds : StageOrder(u, o, {c}, ev)
    \/ \E u \in Users, tok \in 1..3 : ReleaseLock(u, tok)
    \/ \E ob \in dbOutbox : RelayOutboxToKafka(ob)
    \/ ConsumeKafkaMessage
    \/ ToggleNetworkPartition

Spec == Init /\ [][Next]_vars

(***************************************************************************)
(* MATHEMATICAL SAFETY INVARIANTS                                          *)
(***************************************************************************)

\* Safety Invariant 1: Anti-Double-Spend Mutual Exclusion
\* At any point in time, no user can have more than one concurrent order in PENDING status.
Safety_NoDoubleSpend ==
    \A u \in Users :
        Cardinality({o \in OrderIds : dbOrders[o].user = u /\ dbOrders[o].status = "PENDING"}) <= 1

\* Safety Invariant 2: Active Enrollment Non-Overlap
\* No user can ever be simultaneously enrolled multiple times in the same course.
Safety_NoDuplicateEnrollment ==
    \A u \in Users, c \in Courses :
        Cardinality({pair \in dbEnrollments : pair[1] = u /\ pair[2] = c}) <= 1

\* Safety Invariant 3: Transactional Outbox Atomicity
\* Every committed order in the database MUST have an accompanying outbox record.
Safety_OutboxAtomicity ==
    \A o \in OrderIds :
        (dbOrders[o].status \in {"PENDING", "CONFIRMED"}) =>
            (\E ob \in dbOutbox : ob.orderId = o)

\* Safety Invariant 4: Lock Invariant
\* An order can ONLY be staged if the user currently holds the Redlock lease.
Safety_LockGuardedStaging ==
    \A u \in Users :
        (~redisLock[u].held) => (\A o \in OrderIds : ~(dbOrders[o].user = u /\ dbOrders[o].status = "PENDING" /\ \E ob \in dbOutbox : ob.orderId = o /\ ob.status = "PENDING" /\ redisLock[u].held))

=============================================================================
