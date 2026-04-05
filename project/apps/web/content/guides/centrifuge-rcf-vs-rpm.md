# RCF vs RPM for Centrifuge Protocols

## When to use
Use this guide when a protocol reports centrifugation conditions in RCF or g-force, but your centrifuge interface displays RPM, or when you are adapting a protocol from another lab that uses a different rotor.

## Why the distinction matters
RPM is only rotational speed. RCF reflects the actual force experienced by the sample and depends on rotor radius. That means the same RPM can produce different effective force on different instruments.

## The common mistake
Researchers often copy RPM values from papers, kit manuals, or another lab's notes without checking rotor geometry. That can leave the sample under-spun, over-spun, or exposed to unnecessary heat.

## The safer decision process
1. Identify whether the source protocol gives RCF, RPM, or both.
2. Confirm your rotor radius from your actual instrument documentation.
3. Convert force to speed using the rotor you will use today.
4. Ask whether temperature rise, pellet fragility, or sample type changes the acceptable margin.

## Situations where it matters most
- Nucleic acid cleanup and precipitation steps.
- Cell pelleting and wash steps.
- Any protocol where pellet formation is sensitive to force.
- Shared-instrument environments where different rotors are swapped frequently.

## Common interpretation mistakes
- Assuming a published RPM value is portable.
- Using a generic rotor radius instead of the installed rotor.
- Forgetting that long spins at high RPM may increase heat load.
- Failing to record the rotor used in your notes.

## How this connects to BioLT tools
The RCF/RPM calculator converts the target condition quickly. This guide explains why that conversion is necessary and when you should question a copied protocol value rather than trust it automatically.

## Bottom line
If the protocol intent is force, plan in force. Use RPM only as the machine-specific translation for your rotor.
