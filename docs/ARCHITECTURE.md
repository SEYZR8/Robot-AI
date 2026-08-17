# Robot AI Architecture

## Core flow

User -> microphone/text -> realtime gateway -> AI orchestrator -> model/provider -> tools/memory -> response -> speech -> avatar animation.

## Major subsystems

### Avatar
A 3D humanoid presentation layer with idle motion, gaze, facial states, mouth animation and interaction states. The avatar is deliberately separated from the AI brain so the model can be changed without rebuilding the visual layer.

### AI orchestration
The orchestrator owns conversation state, tool permissions, model selection, streaming responses, errors and cancellation.

### Memory
Short-term conversation context is separate from long-term user-approved memory. Persistent memory must be explicit, inspectable and deletable.

### Tools
Tools are capability modules with schemas, validation, authorization and audit events. Internet search, coding assistance, file operations and other capabilities should not be implemented as unrestricted model actions.

### Voice
Speech-to-text and text-to-speech are provider abstractions. Realtime streaming should be supported without coupling the application to a single vendor.

### Vision
Camera/image understanding is an optional capability with explicit permission and clear UI state.

### Security
Secrets stay server-side. Browser clients receive short-lived session credentials. Tool execution is allow-listed and audited. User data is minimized.

## Build strategy

The project is developed vertically: establish the shell, then realtime conversation, then avatar state/animation, then memory and tools, then vision and production deployment. Each layer must remain runnable independently.
