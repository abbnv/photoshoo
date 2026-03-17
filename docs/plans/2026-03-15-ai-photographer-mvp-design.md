# AI Photographer MVP Design

## Goal

Transform the current "upload + preset quiz + generate" flow into a tighter MVP for a virtual AI photographer:

- one photoshoot = one creative brief
- left sidebar = compact conversational setup
- right side = persistent preview/contact sheet
- generation stays in-place, without intermediate success screens
- post-generation actions operate on generated shots, not on the whole photoshoot
- the admin panel becomes the control center for scenes, portrait prompts, formats, and variation chips

The product should feel guided and premium, but the implementation must remain small enough for MVP.

## Product Principles

### 1. One photoshoot, one base creative direction

A photoshoot is defined by:

- use case
- desired impression
- uploaded reference photos
- one selected AI scene
- one set of base generation settings

After the first generation, the base photoshoot settings are considered locked. We do not reopen the entire flow as a freeform editor.

### 2. AI suggests, user selects

We avoid exposing raw prompt-building as the main UX.

Instead:

- the user answers a few short setup questions
- the system proposes several scenes
- the user selects one scene
- the user optionally adjusts a few structured parameters

This preserves the "AI photographer" feeling and prevents the UI from turning into a prompt console.

### 3. Variation happens per generated shot

After generation, the user interacts with individual generated photos.

For MVP, we do not expose "versions" as a separate first-class UI concept. We keep it simple:

- click a generated photo
- choose one variation chip
- generate a new shot based on the same photoshoot and same overall style

Variation changes one dimension at a time.

## Target User Flow

### Step 1. Upload photos

The user uploads 3-8 reference photos.

UX notes:

- drag and drop with strong visual highlight
- simple guidance on which photos work best
- once upload finishes, the upload form disappears
- uploaded thumbnails remain visible in the left sidebar with success state

### Step 2. Answer compact setup questions

The left sidebar shows conversational mini-blocks.

Questions:

1. What is the photoshoot for?

- Instagram
- Avatarka
- Resume
- Website
- Socials
- Universal

2. What impression should the photos create?

- Professional
- Friendly
- Confident
- Stylish
- Premium
- Natural

### Step 3. AI scene selection

Based on the answers, the system proposes 3-6 scenes.

Each scene card contains:

- scene title
- short one-line description
- location category
- lighting mood
- wardrobe direction

The user selects one scene.

### Step 4. Optional structured tuning

We keep this compact. No freeform prompt field in MVP.

Editable structured settings:

- wardrobe preset
- format preset
- generation count (optional if exposed per flow, otherwise admin only)

Location should not be edited as a fully manual selector in MVP. The scene already establishes location logic.

### Step 5. Generate

The right pane already shows the exact number of expected output slots.

During generation:

- slots remain in the same contact-sheet layout
- progress appears on active placeholder cards
- completed images replace placeholders in-place

No separate "gallery" step after generation.

### Step 6. Post-generation

The generated contact sheet stays visible on the right.

The left sidebar switches to an action state:

- open photoshoot
- create another photoshoot
- choose a generated shot for variation

When the user clicks a generated image, we open shot-level actions.

## Post-Generation Variation Model

### Core rule

Variations do not change the whole photoshoot. They create a new generated shot based on:

- the same source photos
- the same selected scene
- the same base style direction
- one structured modifier

### Variation chips for MVP

These are top-level actions only, with no second-level manual selections:

- Another scene
- Another outfit
- Another lighting
- Another expression
- More business
- More lively
- More premium
- More natural

Semantics:

- `Another scene` does not mean changing the entire location category. It means changing the environment/background within the same scene family.
- `Another outfit` changes wardrobe while preserving the same overall shoot direction.
- `Another lighting` changes lighting style while staying within the same creative setup.

No manual prompt box in MVP.

## Interface Model

### Layout

Keep the current two-part structure:

- left: sidebar
- right: preview/contact sheet

But the left area should behave more like a guided conversation than a wizard form.

### Left Sidebar States

#### Setup state

Contains:

- logo
- current step/status badge
- mini-question cards
- uploaded photo thumbnails
- generated scene cards
- primary action button

#### Generation state

Contains:

- concise generation progress
- short explanatory text
- no large success interstitial

#### Ready state

Contains:

- "photos are ready" state
- CTA buttons
- selected-shot variation actions

### Right Pane States

#### Before generation

- placeholder contact sheet
- exact number of slots from admin-configured default generation count
- copy: "Here your generated photos will appear"

#### During generation

- same layout
- placeholder cards animate via progress bars or active progress state
- completed images appear in their final slots

#### After generation

- same layout
- fully clickable contact sheet
- click opens shot actions or lightbox

## Admin Panel Redesign

The current admin panel only supports keys, a flat base prompt, flat edit prompts, and a generation count. That is not enough for the new product model.

We need to evolve admin configuration into a structured "creative system" editor.

### New admin sections

#### 1. API and runtime settings

- FAL API key
- OpenAI API key
- default generations per photoshoot
- default aspect ratio
- default output format
- default output resolution preset

#### 2. Use cases

Configurable list:

- Instagram
- Avatarka
- Resume
- Website
- Socials
- Universal

Each use case can have:

- label
- internal key
- enable/disable
- system instruction hint

#### 3. Impression presets

Examples:

- Professional
- Friendly
- Confident
- Stylish
- Premium
- Natural

Each preset can have:

- label
- internal key
- tone instruction
- optional compatibility hints

#### 4. Scene library

This is the most important section.

Each scene definition should include:

- id
- title
- subtitle
- enabled
- supported use cases
- supported impressions
- scene prompt template
- portrait prompt template
- location family
- lighting family
- wardrobe family
- composition hint
- format constraints
- weight / ranking priority

This allows the app to propose scenes instead of raw prompt options.

#### 5. Portrait generation settings

Separate from scene prompting.

We should support:

- base portrait prompt template
- portrait polish prompt template
- negative prompt / restrictions if model supports it
- number of outputs
- aspect ratio
- output format

#### 6. Variation chips

Variation chips must be admin-driven.

Each chip should include:

- label
- internal key
- enabled
- variation instruction template
- compatible scene families
- compatible use cases
- display order

Example:

- label: Another outfit
- key: another_outfit
- instruction: Keep the same person, same scene family and framing, but generate a different wardrobe variation appropriate to the same shoot concept.

#### 7. Format presets

Used for generation output and future export.

Each preset should include:

- label
- key
- aspect ratio
- width/height or output size preset
- enabled

Examples:

- Portrait 9:16
- Square avatar 1:1
- Profile 4:5

## Suggested Data Model Changes

For MVP we can still keep a single `AdminConfig` row, but its internal JSON must become more structured.

### AdminConfig should evolve to contain JSON sections

Suggested fields:

- `runtimeSettings` JSON
- `useCaseOptions` JSON
- `impressionOptions` JSON
- `sceneDefinitions` JSON
- `variationChips` JSON
- `formatPresets` JSON
- `portraitPromptConfig` JSON

This is better than adding many columns for every evolving concept.

### Photoshoot should evolve

Current fields are too generic.

We should add or derive support for:

- `useCase`
- `impression`
- `selectedSceneId`
- `sceneSnapshot` JSON
- `settingsSnapshot` JSON

Why snapshot:

- admin definitions may change over time
- existing photoshoots must remain reproducible

### GeneratedImage should evolve

Suggested additions:

- `photoshootId`
- `sourceGeneratedImageId` nullable
- `generationType` enum-ish string:
  - `base`
  - `variation`
- `variationKey` nullable
- `sceneSnapshot` JSON nullable
- `promptSnapshot` text or JSON

This gives us enough room for shot-level variation later without building a full "version" system in the UI now.

## API Changes

### New server responsibilities

#### Scene recommendation endpoint

We need an endpoint that accepts:

- use case
- impression

And returns:

- 3-6 recommended scenes

Could be:

- `POST /api/photoshoots/scene-recommendations`

Or generated inside the photoshoot create flow.

#### Photoshoot creation flow

The current create endpoint only creates a generic draft.

We should update the workflow to store:

- use case
- impression
- selected scene
- settings snapshot

#### Generate endpoint

The generate endpoint should no longer only consume quiz answers.

It should consume a structured creative brief:

- use case
- impression
- selected scene snapshot
- structured settings
- portrait generation settings

#### Variation endpoint

Future MVP endpoint:

- `POST /api/generated-images/[id]/variation`

Payload:

- variation chip key

Server behavior:

- load the selected generated image
- load the parent photoshoot creative brief
- apply chip instruction
- generate one or more variation shots

## Prompting Strategy

We need to stop thinking in terms of one giant prompt.

Instead, prompting should be layered:

1. identity preservation / person consistency
2. scene prompt
3. portrait quality prompt
4. use-case alignment
5. variation modifier

### Scene prompt

Defines:

- environment
- overall mood
- composition direction

### Portrait prompt

Defines:

- quality
- realism
- camera feel
- skin and facial fidelity

### Variation prompt

Defines:

- one controlled change while preserving the rest

## MVP Scope Recommendations

### In scope

- compact sidebar setup flow
- use case + impression setup
- AI scene suggestions
- selected scene generation
- admin-managed scene definitions
- admin-managed variation chips
- admin-managed portrait settings and format presets
- persistent right-side contact sheet
- post-generation shot-level variations using chips

### Out of scope

- manual freeform prompt editing
- exposed version history UI
- multi-version comparison UI
- branching workflow
- team collaboration
- export packs beyond a simple baseline

## Implementation Sequence

### Phase 1

- redesign admin config schema as structured JSON sections
- redesign admin UI to manage scenes, chips, portrait prompt settings, formats
- keep current generation working while adding new config storage

### Phase 2

- replace current quiz with:
  - use case
  - impression
  - scene selection
- update photoshoot creation and snapshots

### Phase 3

- update generate endpoint to consume scene snapshots and portrait config
- keep contact sheet generation behavior

### Phase 4

- add shot-level variation chips
- add variation generation endpoint and UI on image click

## Open Decisions

1. Should scene recommendation be purely rule-based from admin JSON, or partially model-assisted?
Recommendation for MVP: rule-based plus weights.

2. Should format presets affect generation or only export?
Recommendation for MVP: generation first, export later.

3. Should use-case selection be required?
Recommendation: yes, because it drives the entire scene selection logic.

## Summary

The product should evolve from a preset-based generator into a tightly scoped AI photographer workflow:

- minimal setup
- scene recommendation
- structured generation
- in-place contact sheet
- shot-level variation by chips

The admin panel should become the real control surface for:

- scene prompts
- portrait prompts
- generation formats
- variation chip behavior

This preserves the product magic while keeping the MVP manageable.
