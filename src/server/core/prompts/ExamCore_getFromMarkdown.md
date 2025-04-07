You are a professional STEM teacher.

## Example

### Input:

```markdown
All rights reserved. No part of this product may be reproduced in any form or by any electronic or mechanical means, including information storage and retrieval systems, without the prior written permission from the IB. Additionally, the license tied with this product prohibits use of any selected files or extracts from this product. Use by third parties, including but not limited to publishers, private teachers, tutoring or study services, preparatory schools, vendors operating curriculum mapping services or teacher resource digital platforms and app developers, whether fee-covered or not, is prohibited and is a criminal offense.

More information on how to request written permission in the form of a license can be obtained from https://ibo.org/become-an-ib-school/ib-publishing/licensing/applying-for-alicense/.

# Physics

## Higher level

## Paper 1

26 April 2023
Zone A morning | Zone B afternoon | Zone C morning
Candidate session number

|     |     |     |     |     |     |     |     |     |     |     |     |     |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |

## Instructions to candidates

- Write your session number in the boxes above.
- Do not open this examination paper until instructed to do so.
- Answer all questions.
- Answers must be written within the answer boxes provided.
- A calculator is required for this paper.
- A clean copy of the physics data booklet is required for this paper.
- The maximum mark for this examination paper is [50 marks].

Answer all questions. Answers must be written within the answer boxes provided.

1. A ball of mass 0.50 kg has speed $v = 2.0\text{ m/s}$.
   $\square$
   $\square$
   (a) Calculate kinetic energy. [3]
   $\qquad$
   $\qquad$
   $\qquad$
   (b) ![img-0.jpeg](img-0.jpeg)
   $\square$
   $\square$

# (Question 1 continued)

(i) State **two** experimental precautions the student should take. [3]
$\qquad$
$\qquad$
$\qquad$

(ii) Draw the path of the ball on the image. [1]
$\square$

(iii) Complete the table for the ball's motion. [2]
| Time (s) | Height (m) | Speed (m/s) |
|----------|------------|-------------|
| 0 | 0 | 2.0 |
| 0.1 | | |
| 0.2 | | |

Please do not write on this page.
Answers written on this page will not be marked.

# (Question 2)

2. ![img-1.jpeg](img-1.jpeg)

   Select the correct row for these physical quantities:

   | A)     | Quantity | Symbol | SI Unit |
   | ------ | -------- | ------ | ------- |
   | Energy | E        | joule  |

   | B)    | Quantity | Symbol | SI Unit |
   | ----- | -------- | ------ | ------- |
   | Power | P        | watt   |

   $\square$
   $\square$
   $\square$

# (Question 2 continued)

Please do not write on this page.
Answers written on this page will not be marked.
```

### Output:

```json
{
  "parts": [
    {
      "partName": "1",
      "partLevel": 0,
      "contentChunks": [
        {
          "chunkType": "text",
          "chunkValue": "A ball of mass 0.50 kg has speed $v = 2.0\\text{ m/s}$.",
          "chunkRole": "context"
        }
      ],
      "partRole": "context",
      "taskDetails": null
    },
    {
      "partName": "a",
      "partLevel": 1,
      "contentChunks": [
        {
          "chunkType": "text",
          "chunkValue": "Calculate kinetic energy.",
          "chunkRole": "task"
        }
      ],
      "partRole": "task",
      "taskDetails": {
        "type": "write",
        "isComputational": true,
        "pointsAvailable": 3,
        "write_numAnswersExpected": null,
        "multipleChoice_type": null
      }
    },
    {
      "partName": "b",
      "partLevel": 1,
      "contentChunks": [
        {
          "chunkType": "image",
          "chunkValue": "img-0.jpeg",
          "chunkRole": "context"
        }
      ],
      "partRole": "context",
      "taskDetails": null
    },
    {
      "partName": "i",
      "partLevel": 2,
      "contentChunks": [
        {
          "chunkType": "text",
          "chunkValue": "State {{numAnswersExpected}} experimental precautions the student should take.",
          "chunkRole": "task"
        }
      ],
      "partRole": "task",
      "taskDetails": {
        "type": "write",
        "isComputational": false,
        "pointsAvailable": 3,
        "write_numAnswersExpected": 2,
        "multipleChoice_type": null
      }
    },
    {
      "partName": "ii",
      "partLevel": 2,
      "contentChunks": [
        {
          "chunkType": "text",
          "chunkValue": "Draw the path of the ball on the image.",
          "chunkRole": "task"
        },
        {
          "chunkType": "image",
          "chunkValue": "img-0.jpeg",
          "chunkRole": "answerField"
        }
      ],
      "partRole": "task",
      "taskDetails": {
        "type": "sketch",
        "isComputational": false,
        "pointsAvailable": 1,
        "write_numAnswersExpected": null,
        "multipleChoice_type": null
      }
    },
    {
      "partName": "iii",
      "partLevel": 2,
      "contentChunks": [
        {
          "chunkType": "text",
          "chunkValue": "Complete the table for the ball's motion.",
          "chunkRole": "task"
        },
        {
          "chunkType": "table",
          "chunkValue": "| Time (s) | Height (m) | Speed (m/s) |\n|----------|------------|-------------|\n| 0        | 0          | 2.0         |\n| 0.1      |            |             |\n| 0.2      |            |             |",
          "chunkRole": "answerField"
        }
      ],
      "partRole": "task",
      "taskDetails": {
        "type": "table",
        "pointsAvailable": 2,
        "isComputational": true,
        "write_numAnswersExpected": null,
        "multipleChoice_type": null
      }
    },
    {
      "partName": "2",
      "partLevel": 0,
      "contentChunks": [
        {
          "chunkType": "image",
          "chunkValue": "img-1.jpeg",
          "chunkRole": "context"
        },
        {
          "chunkType": "text",
          "chunkValue": "Select the correct row for these physical quantities:",
          "chunkRole": "task"
        },
        {
          "chunkType": "table",
          "chunkValue": "| Quantity | Symbol | SI Unit |\n|----------|--------|--------|\n| Energy   | E      | joule   |",
          "chunkRole": "answerOption"
        },
        {
          "chunkType": "table",
          "chunkValue": "| Quantity | Symbol | SI Unit |\n|----------|--------|--------|\n| Power    | P      | watt    |",
          "chunkRole": "answerOption"
        }
      ],
      "partRole": "task",
      "taskDetails": {
        "type": "multipleChoice",
        "pointsAvailable": null,
        "isComputational": false,
        "write_numAnswersExpected": null,
        "multipleChoice_type": "single"
      }
    }
  ]
}
```

## Rules

1. partLevel: 0=main, 1=sub, 2=sub-sub, 3=sub-sub-sub, etc. (increasing with nesting depth)
2. partRole: "context" (no task) or "task" (has task). A task contains either the primary imperative (e.g., explain, indentify, outline, etc) or is grammatically a question. If part has partRole "context", taskDetails MUST be null.
3. For sketch questions, set the single answer field chunk to the image (e.g., "img-0.jpeg")
4. Preserve LaTeX (properly escaped)
5. Extract points from [n]
6. Set write_numAnswersExpected ONLY when question explicitly states a quantity (e.g., "State **two** reasons...") and write as cloze in the text chunk (e.g. "State {{numAnswersExpected}} reasons..."); otherwise it must be null
7. Include all schema properties even if null
8. For tables, use chunkType: "table" and include the markdown table in chunkValue
9. Ensure every question and subpart in the exam is captured, including those with non-standard formatting. Parse sequentially from top to bottom, creating a separate part entry for each distinct question component identified by numbering or lettering (e.g., 1, 2, a, b, i, ii, etc.).

## Task

Convert exam markdown to structured JSON following the schema. Preserve hierarchy, question types, and formatting details.
