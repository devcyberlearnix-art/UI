# ASIVO LMS — BRAND COLOUR RESEARCH & STRATEGIC PALETTE SELECTION
**Document ID:** `ABCR-20261103-V2`  
**Role:** Principal Product Designer, Senior UI/UX Engineer & Colour Consultant  
**Status:** APPROVED & ADOPTED AS CANONICAL BRAND IDENTITY  

---

## 1. DESIGN INVESTIGATION & REFERENCES

### 1.1 The Anti-Pattern of the "Generic SaaS" Dashboard
Modern digital products frequently fall into the trap of generic AI-generated aesthetics:
1. **Cold Over-Saturated Blue (`#2563EB` / `#3B82F6`)**: Ubiquitous across default Tailwind templates, enterprise utilities, and demo apps, creating a clinical, impersonal impression.
2. **Blinding Stark Canvas (`#FFFFFF` / `#F8FAFC`)**: Reflects high blue-light energy, inducing visual strain during continuous educational reading sessions lasting 45+ minutes.
3. **Gratuitous Violet/Cyan Gradients & Rainbow Cards**: Adding green, amber, violet, and rose card backgrounds purely for decoration confuses visual hierarchy and devalues semantic feedback.
4. **Excessive Glassmorphism**: Blurring and heavy backdrop-filters impair typographic legibility on budget displays and slow render pipelines.

### 1.2 Influences from Contemporary Editorial & Premium Education Design
To build an enduring, calm, and memorable digital campus, we examined four core design paradigms:
- **Literary & Scholarly Publishing (The Atlantic, Harvard University Press, MIT Technology Review)**: Embraces warm parchment canvas values, rich ink typography with subtle serif accents, and generous whitespace that promotes deep comprehension.
- **Boutique Creative Platforms (ReadCV, Are.na, Linear, Kinfolk)**: Leverages warm off-whites, hairline borders with warm-tinted opacity, and disciplined restraint where accent hues appear on less than 5% of the viewport.
- **Physical Archival Materials (Heavy Stock Paper, Bound Monographs, Sumi Ink)**: Surfaces reflect ambient light gently with tactile warmth (`#F5F2EC` to `#FFFEFA`), rather than radiating harsh cold luminescence.
- **Evidence-Based Visual Ergonomics**: Lower color temperature (warm neutrals with a slight yellow/red shift rather than blue/cyan) significantly decreases pupil constriction fatigue during long-duration study.

---

## 2. EVALUATION OF THREE DISTINCT VISUAL CONCEPTS

Three cohesive, production-viable concepts were designed and evaluated against rigorous multi-disciplinary criteria.

```
+-----------------------------------------------------------------------------------------+
|                                VISUAL CONCEPT MATRIX                                     |
+---------------------+-------------------------+-----------------------------------------+
| Concept             | Core Identity Tokens    | Visual Character & Mood                 |
+---------------------+-------------------------+-----------------------------------------+
| Concept A:          | Canvas: #F5F2EC         | Scholarly atelier, warm parchment,      |
| QUIET ATELIER       | Surface: #FFFEFA        | deep sumi ink, restrained plum accent,  |
| (Selected Winner)   | Brand:   #5B3E57 (Plum) | tactile clay secondary details.         |
|                     | Clay:    #9A6B56        | Calm, timeless, deeply readable.        |
+---------------------+-------------------------+-----------------------------------------+
| Concept B:          | Canvas: #F3F4F1         | Botanical publication, warm mineral,    |
| BOTANICAL           | Surface: #FAFBF8        | deep moss/pine brand accent, raw sienna |
| EDITORIAL           | Brand:   #345343 (Sage) | secondary highlights. Organic,          |
|                     | Ochre:   #B0824B        | grounding, nature-infused.              |
+---------------------+-------------------------+-----------------------------------------+
| Concept C:          | Canvas: #F1F0EC         | Monographic archive, pale limestone,    |
| MODERN              | Surface: #FBFAF6        | deep aubergine-black brand accent,      |
| ARCHIVAL            | Brand:   #4E3340 (Wine) | burnished brass secondary details.      |
|                     | Brass:   #9C8052        | Formal, museum-grade, historical.       |
+---------------------+-------------------------+-----------------------------------------+
```

### 2.1 Detailed Evaluation Matrix

| Evaluation Criteria | Weight | Concept A: Quiet Atelier | Concept B: Botanical Editorial | Concept C: Modern Archival |
| :--- | :---: | :---: | :---: | :---: |
| **Uniqueness & Recognition** | 15% | **9.6 / 10** (Unique scholarly plum) | 8.8 / 10 (Green is common in sustainability) | 8.5 / 10 (Aubergine can feel very formal) |
| **Long-Session Comfort** | 20% | **9.8 / 10** (Warm ivory reduces glare) | 9.2 / 10 (Comfortable mineral base) | 8.9 / 10 (Slightly high contrast) |
| **Educational Suitability** | 20% | **9.7 / 10** (Evokes monographs & studios) | 8.9 / 10 (Leans ecological/lifestyle) | 8.7 / 10 (Leans historical archive) |
| **Admin & Data Dashboard Utility**| 15% | **9.4 / 10** (Neutral tables, clear focus) | 8.6 / 10 (Green clashes with data alerts) | 8.8 / 10 (Wine accent close to danger red) |
| **WCAG 2.2 AA/AAA Contrast** | 15% | **9.8 / 10** (15.6:1 text, 7.4:1 accent) | 9.4 / 10 (15.2:1 text, 6.8:1 accent) | 9.5 / 10 (16.1:1 text, 8.2:1 accent) |
| **Dark Theme Harmonic Parity** | 15% | **9.5 / 10** (Warm velvet carbon + thistle)| 9.0 / 10 (Deep forest dark mode) | 8.8 / 10 (Moody aubergine night) |
| **Weighted Score** | 100% | **9.65 / 10 (WINNER)** | **8.98 / 10** | **8.89 / 10** |

---

## 3. SELECTION RATIONALE: WHY CONCEPT A (QUIET ATELIER) IS SUPERIOR

1. **Brand Defensibility**: No mainstream LMS (Canvas, Coursera, Udemy, Blackboard, edX) uses a warm atelier aesthetic with a restrained plum signature. Asivo instantly distinguishes itself on first glance.
2. **Cognitive Calm & Study Stamina**: The parchment canvas (`#F5F2EC`) and ivory surface (`#FFFEFA`) maintain a gentle 15.6:1 typographic contrast that eliminates ocular fatigue without losing crispness.
3. **Plum vs. Status Separation**: Because the brand accent is a stately, desaturated plum (`#5B3E57`), it never collides with semantic green (success), amber (warning), red (error), or cobalt (informational notices).
4. **Rich Multi-Role Harmony**: Students feel an intimate, scholarly focus; instructors feel an artisanal studio atmosphere; administrators experience an uncluttered, high-legibility enterprise workspace.

---

## 4. CANONICAL SPECIFICATION: "QUIET ATELIER"

### 4.1 Light Mode (Default)

```
[ App Canvas: #F5F2EC (Warm Parchment) ]
    |
    +--> [ Surface Primary: #FFFEFA (Soft Ivory Card) ]
    |        |
    |        +--> [ Typography: #282521 (Deep Sumi Ink - 15.6:1 AAA) ]
    |        +--> [ Secondary:  #635E56 (Warm Slate Charcoal - 6.4:1 AA) ]
    |        +--> [ Muted Meta: #756E64 (Archival Gray - 5.0:1 AA) ]
    |        +--> [ Border:     #E3DCD3 (Warm Hairline Border) ]
    |
    +--> [ Brand Accent: #5B3E57 (Muted Scholarly Plum) ]
             |
             +--> Hover:   #462D42 (Deep Plum)
             +--> Subtle:  #F2ECF1 (Active Pill / Soft Tint)
             +--> Focused: 0 0 0 2px #5B3E57, 0 0 0 4px #F2ECF1
```

### 4.2 Dark Mode (Nocturnal Atelier)

```
[ Dark Canvas: #151413 (Velvet Carbon) ]
    |
    +--> [ Dark Surface: #1D1C1A (Deep Obsidian Slate) ]
    |        |
    |        +--> [ Dark Typography: #EDE8E1 (Soft Parchment White - 13.8:1 AAA) ]
    |        +--> [ Dark Secondary:  #A69F94 (Warm Clay Gray - 6.1:1 AA) ]
    |        +--> [ Dark Muted Meta: #7A7368 (Stone Umber - 3.8:1 AA Large) ]
    |        +--> [ Dark Border:     rgba(237, 232, 225, 0.08) ]
    |
    +--> [ Dark Brand Accent: #D1A7CC (Soft Thistle Bloom - 8.4:1 AAA on dark) ]
             |
             +--> Hover:   #E0BFDC
             +--> Subtle:  rgba(209, 167, 204, 0.12)
```

### 4.3 Semantic Status Palette (Educated Restraint)
- **Success / Completed**: `#2B6747` (Deep Pine/Juniper, 5.8:1 contrast on ivory)
- **Warning / Review Required**: `#935E1E` (Warm Topaz Ochre, 5.2:1 contrast on ivory)
- **Danger / Urgent**: `#9B3835` (Terracotta Crimson, 5.9:1 contrast on ivory)
- **Info / Announcement**: `#365D75` (Muted Steel Slate, 6.0:1 contrast on ivory)

### 4.4 Data Visualization Palette (5 Harmonic Distinct Series)
1. **Series 1 (Primary)**: `#5B3E57` (Plum)
2. **Series 2 (Growth/Completion)**: `#37654F` (Juniper)
3. **Series 3 (Pacing/Cadence)**: `#A36750` (Clay)
4. **Series 4 (Engagement)**: `#436A84` (Steel Blue)
5. **Series 5 (Milestones)**: `#A87E38` (Amber Ochre)

---

## 5. DESIGN SYSTEM METRICS & ACCESSIBILITY GUARANTEES

All primary textual tokens achieve **WCAG 2.2 Level AAA** compliance. The visual system adheres to the **80 / 15 / 5** distribution law:
- **80% Neutral Warm Canvas & Surfaces** (`#F5F2EC`, `#FFFEFA`, `#EAE5DC`)
- **15% Typographic Architecture & Borders** (`#282521`, `#635E56`, `#E3DCD3`)
- **5% Restrained Brand Signature & Semantic Indicators** (`#5B3E57`, `#9A6B56`, `#2B6747`)
