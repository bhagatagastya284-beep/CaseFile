# Citation Prompt

For each piece of evidence, produce a citation with the source name, URL, retrieval
date, and a confidence score (0-1) reflecting how directly the evidence supports the
claim it is attached to and how reliable the source appears to be.

This step is primarily deterministic (derived from stored Evidence/Source records) and
only falls back to the AI model to estimate a confidence score when one is not already
available.
