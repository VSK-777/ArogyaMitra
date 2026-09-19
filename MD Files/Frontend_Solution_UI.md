# Part 1: Frontend Member — Proposed Solution & User Interfaces

## 1. Frontend Architecture Overview

The ArogyaMitra frontend is a robust Single Page Application (SPA) designed to handle real-time AI interactions, asynchronous document processing, and complex state management across multiple user roles (Patient vs. Doctor).

### 1.1 Component Tree & File Structure
```text
frontend/src/
├── api/                  # Axios instances and API endpoint wrappers
│   ├── preConsultationApi.ts
│   └── doctorApi.ts
├── components/           # Reusable presentational UI elements
│   ├── ui/               # Tailwind atomic components (Buttons, Cards, Modals)
│   └── documents/        # Specialized components (DocumentUploader, DocumentList)
├── contexts/             # Global React Contexts
│   ├── AuthContext.tsx   # Manages JWT tokens, Login state, and User Role
│   └── LocaleContext.tsx # Manages i18n language switching
├── hooks/                # Custom React Hooks
│   ├── useAudioRecorder.ts # Encapsulates the Web MediaRecorder API
│   └── useAiChat.ts      # Manages the chat array and loading states
├── locales/              # i18next JSON files (en.json, te.json)
├── modules/              # Heavy feature modules (Page-level components)
│   ├── preconsultation/  # Patient AI Chat interface
│   └── consultation/     # Doctor Dashboard interface
└── main.tsx              # React DOM mounting & Router configuration
```

## 2. Deep Dive: Patient Pre-Consultation UI

The most complex interface in the system is the AI intake chat (`PreConsultation.tsx`).

### 2.1 Audio Capture Implementation
We built a custom hook (`useAudioRecorder.ts`) that interfaces with the browser's native `MediaRecorder` API. 
1. **Permissions:** The UI requests microphone access. If denied, a graceful error toast (`react-hot-toast`) is shown.
2. **Recording State:** A pulsing red indicator is shown. A `setTimeout` enforces a strict 60-second cap to prevent massive file uploads.
3. **Blob Conversion:** When stopped, the audio chunks are assembled into a `new Blob(chunks, { type: 'audio/webm' })`.
4. **Transmission:** The Blob is appended to a `FormData` object and posted to the backend, which proxies it to Gemini's multimodal endpoint for transcription.

### 2.2 Chat Bubble Rendering Logic
The AI returns a single string like: 
*"Noted: The patient reports severe migraines. Question: How long have you experienced this?"*

Instead of showing a raw block of text, the React component parses this string locally:
```typescript
const parseAiMessage = (rawText: string) => {
    // Regex splits the string by "Noted:" and "Question:"
    const notedMatch = rawText.match(/Noted:\s*(.*?)(?=Question:|$)/i);
    const questionMatch = rawText.match(/Question:\s*(.*)/i);
    
    return {
        clinicalNote: notedMatch ? notedMatch[1].trim() : null,
        userFacingQuestion: questionMatch ? questionMatch[1].trim() : rawText
    };
}
```
*   **clinicalNote:** Rendered inside a muted, blue-bordered "Clinical Observation" card.
*   **userFacingQuestion:** Rendered as a highly visible, standard chat bubble prompting the user to reply.

## 3. Deep Dive: Doctor Consultation Dashboard

The `ConsultationMode.tsx` UI is a split-pane interface designed to reduce cognitive load on the physician.

### 3.1 The Left Pane (AI Intake Summary)
This pane consumes the JSON returned by the `/api/doctor/pre-consultation/{id}` endpoint.
Because the backend Medical Document Summarizer extracts strict JSON (using Temperature 0.0), the React UI maps over arrays to render beautiful UI cards:
*   **Vitals & Labs:** Rendered as a grid of badges (e.g., `<Badge color="red">BP: 150/90 (High)</Badge>`).
*   **Pre-Consultation Transcript:** Displayed as a concise bulleted list.

### 3.2 The Right Pane (Action Area)
*   **Shorthand Input:** The doctor types brief notes (e.g., "r/o appendicitis, prescribed anti-emetics").
*   **AI Draft Action:** Clicking the ✨ "Draft Clinical Documentation" button hits the backend `/api/doctor/notes/draft` endpoint. The text area morphs into a loading skeleton, then dynamically replaces the shorthand with a polished medical paragraph.
*   **Finalization:** Clicking "Sign Encounter" executes the final database commit, altering the Appointment Status to `COMPLETED`.

## 4. Internationalization (Telugu Support)

We use `react-i18next` for seamless language switching.
However, it goes beyond UI translations. In our `preConsultationApi.ts` Axios interceptor, we inject language context into the AI payload:

```typescript
// Interceptor pseudo-code
axios.interceptors.request.use(config => {
    const currentLanguage = i18next.language; // 'te' or 'en'
    if (currentLanguage.startsWith('te') && config.data?.text) {
        config.data.text += " (System note: Please reply in Telugu language)";
    }
    return config;
});
```
This guarantees the LLM respects the user's localized UI preference.
