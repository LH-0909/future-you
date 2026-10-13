# Anatomy model attribution

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- Original dataset: BodyParts3D 4.0, adult male reference anatomy.
- Original source and current license: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- Dataset download: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- Browser-ready source distribution: Human Atlas by ashemag, https://github.com/ashemag/human-atlas
- Pinned source commit: `1c38bf35c254a891200d3cedecfd57abebe83d8d`.
- Upstream attribution and conversion details: [UPSTREAM-ATTRIBUTION.md](UPSTREAM-ATTRIBUTION.md).

Lung tissue: Human Reference Atlas / HuBMAP, male lung reference v1.4, by Kristen Browne and Heidi Schlehlein, created 2024-06-15. CC BY 4.0.

- Object and metadata: https://purl.humanatlas.io/ref-organ/lung-male/v1.4
- 3D Reference Library: https://humanatlas.io/3d-reference-library
- Source geometry: https://cdn.humanatlas.io/digital-objects/ref-organ/lung-male/v1.4/assets/3d-vh-m-lung.glb
- Ontology crosswalk: https://cdn.humanatlas.io/digital-objects/ref-organ/lung-male/v1.4/assets/crosswalk.csv
- Library source license: https://github.com/hubmapconsortium/ccf-3d-reference-object-library/blob/main/LICENSE

The license for both sets of anatomy data is Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/ . The data and adapted model can be redistributed under those terms. No endorsement by the original authors is implied.

Future You adaptations: retain 1,023 selected BodyParts3D structures and 27 HRA lung structures; preserve structure identifiers, names and ontology identifiers; simplify geometry with meshoptimizer at maximum 0.6% relative geometric error; merge into 14 rendering batches; change display materials and highlighting. HRA lung tissue is aligned with a uniform scale and translation to the BodyParts3D bronchial tree. This is an educational composite, not a registration of a single person's anatomy.

The final model has 757,622 triangles. Compressed model data is 12,268,503 bytes. `anatomy-preview.png` is a screenshot rendered from the same adapted model for the lightweight view, under the same attribution requirements.

Lumbar explorer adaptation: `spine.json` / `spine.bin` extract 13 distinct BodyParts3D source structures from the same pinned Human Atlas distribution, without the additional whole-body batch simplification: five lumbar vertebrae, five lumbar disks, sacrum and left/right hip bones. Source names and FMA identifiers are retained. Display materials and Chinese labels are authored for this lesson. Exploded viewing translates rigid meshes only; it does not deform source anatomy or calculate biomechanical motion. The extracted model has 34,550 triangles and 901,968 binary bytes, under the same CC BY 4.0 attribution.

Unified teaching-body adaptation: `teaching-body.json` / `teaching-body.bin` extract 22 source meshes (T10–T12, L1–L5, five lumbar disks, sacrum, hip bones and six lumbar muscle meshes), 48,120 triangles and 1,316,512 bytes. Geometry is not additionally simplified. Rigid teaching poses, movement outlines, assembly targets and display colors are application adaptations, not measured anatomy or biomechanical results. License remains CC BY 4.0.

This educational reference is not a patient scan, clinical digital twin, diagnostic model, or surgical planning tool. It does not cover all human anatomical variation. The application code, lifestyle rules and interface are authored separately from the model data.
