# Business Rules and Validation

## Dispatch invariants

| Rule | Client behavior | Server enforcement |
| --- | --- | --- |
| Registration is unique | Async field warning | Unique Mongo index and duplicate-key mapping |
| Retired or maintenance vehicle | Disabled selection | Transactional status check |
| Expired or suspended driver | Disabled selection + alert | License/status check at dispatch |
| Driver/vehicle already on trip | Availability badge | Query active trip + conditional update |
| Cargo exceeds capacity | Inline weight error | Numeric comparison with vehicle capacity |
| Valid state transition | Only valid action shown | State-machine transition guard |

## State transitions

```text
Trip: draft → scheduled → dispatched → in_progress → completed
                         └──────────────→ cancelled
Vehicle: available ↔ on_trip; available ↔ maintenance; available → retired
Driver:  available ↔ on_trip; available ↔ suspended; suspended → available
```

Maintenance creation changes an eligible vehicle to `maintenance`. Closing maintenance restores `available` only when no other open maintenance request or active trip exists. A retired vehicle is terminal and cannot be assigned.

## Validation standards

Normalize strings before comparison, require ISO dates, reject negative monetary and distance values, and cap uploads and page sizes. Frontend validation is for clarity; API validation is authoritative. Service-level checks must run even if a client bypasses the UI.
