<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history — force pushing, or rebasing/amending/squashing commits that are already pushed — as it rewrites history on Lovable's side and the user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep DepthWizard as a frontend-only demo with centralized sample project data in `src/lib/demo.ts`; this keeps future API replacement isolated.
- Render the Three.js terrain client-side in `src/components/terrain-viewer.tsx`; WebGL requires a browser and cannot render during SSR.
