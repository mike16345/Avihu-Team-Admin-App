# Diet V2 Meal Identity and Validation Correction

## Goal

Make MongoDB the owner of persisted V2 meal identity, allow update routes to derive `userId`
authoritatively, and require trainers to enter every meal macro before saving a new plan.

## Meal identity

- Persisted meals use Mongoose subdocument `_id` values.
- The custom persisted `id` field is removed from Server and Admin contracts.
- `_id` is optional in request types because newly-created meals do not have a database identity.
- The Server preserves a supplied meal `_id` while replacing an existing plan or preset and lets
  Mongoose generate `_id` for new meals.
- The Admin uses `meal._id` as the React key for saved meals and React Hook Form's generated field
  ID for unsaved meals. RHF field IDs are UI-only and are never persisted.
- Copying a meal or applying a preset to a trainee removes the source meal `_id`, allowing the
  destination document to receive a new identity.

## Update validation

- Diet-plan creation continues to require `userId` in the body.
- Both update routes accept bodies without `userId` because their controllers already derive it
  from the current plan or the route's trainee ID.
- Controllers continue to overwrite any client-supplied `userId`; body identity is not trusted.
- V1 and V2 update validation follow the same rule.

## Required macros

- Every meal requires calories, protein, carbohydrates, and fat.
- Each value must be numeric, finite, and non-negative. Zero remains valid.
- New Admin meals start with blank macro inputs rather than prefilled zeroes, so untouched fields
  cannot pass form validation accidentally.
- Existing saved zero values remain valid and render as zero.
- Server Joi and Mongoose validation remain the final boundary and reject missing macro fields.

## Compatibility

Existing V2 documents without meal `_id` remain readable. Mongoose supplies missing subdocument
IDs when the document is next materialized and saved; no production migration is required for this
change. Legacy `id` values are no longer part of replacement payloads.

## Verification

- Server tests prove generated and preserved meal `_id`, update bodies without `userId`, creation
  bodies without `userId` remaining invalid, and missing macros remaining invalid.
- Admin tests prove new macro inputs are blank and block persistence until all four are entered,
  existing `_id` values round-trip on update, and newly copied/applied meals do not reuse source
  IDs.
