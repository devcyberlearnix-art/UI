#!/bin/bash
# ==============================================================================
# CyberLearnIX / FD_LMS PostgreSQL Multi-Database Initialization Script
# Automatically creates isolated schemas for all 11 microservices on initial boot
# ==============================================================================

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating microservice database '$database'..."
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "All 11 microservice databases successfully provisioned."
fi
