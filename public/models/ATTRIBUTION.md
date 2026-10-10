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

This educational reference is not a patient scan, clinical digital twin, diagnostic model, or surgical planning tool. It does not cover all human anatomical variation. The application code, lifestyle rules and interface are authored separately from the model data.
