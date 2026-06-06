LLM pentesting (Large Language Model penetration testing) is the process of testing an AI language model to find weaknesses in its behavior, safety, and reliability.

It involves checking how the model responds to different inputs to understand whether it can be misled, produce incorrect or unsafe outputs, or fail to follow intended rules. The goal is to improve the model’s security, accuracy, and robustness before real-world use.

## OWASP Top 10

https://genai.owasp.org/llm-top-10/

## LLM Basics

| **Concept**                     | **Meaning**                                                                               | **Simple Example**                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Model**                       | The AI system that understands input and generates responses based on patterns it learned | Think of it like a super advanced autocomplete that can also write essays, solve problems, or code |
| **Prompt**                      | The instruction or question you give to the AI                                            | “Explain photosynthesis like I’m 10 years old”                                                     |
| **Context Window**              | How much conversation text the AI can keep in mind at once                                | If you chat too long, the AI may forget what you said at the beginning                             |
| **Tokens**                      | Small chunks of text the AI reads (not always full words)                                 | “ChatGPT is great” becomes pieces like “Chat”, “GPT”, “is”, “great”                                |
| **System Message**              | Hidden rules that control how the AI should behave                                        | “Be helpful, safe, and don’t give harmful instructions” (you don’t normally see this)              |
| **Developer Message**           | App-level instructions that shape how the AI behaves in a specific app                    | A chatbot app saying: “Keep answers short and formal”                                              |
| **User Message**                | What you directly type to the AI                                                          | “What is machine learning?”                                                                        |
| **Inference**                   | The moment the AI generates an answer                                                     | You ask a question and instantly get a response back                                               |
| **Training Data**               | The huge amount of text used to teach the AI                                              | Books, websites, articles, code used before the AI was released                                    |
| **Temperature**                 | Controls how creative or random the answer is                                             | Low = factual answer, High = more creative or story-like response                                  |
| **Alignment**                   | How well the AI follows human rules and stays safe                                        | The AI refusing harmful requests and staying helpful                                               |
| **Tool Use (Function Calling)** | When AI uses external systems like APIs or tools                                          | Asking “weather today” → AI calls a weather service instead of guessing                            |
| **Memory (if available)**       | Ability to remember past chats                                                            | AI remembering your name or preferences in later conversations                                     |

---

## Core Concept

* **Model = brain**
* **Prompt = question**
* **Context = short-term memory**
* **Tokens = words broken into pieces**
* **System message = hidden teacher rules**
* **Inference = thinking and answering process**

---

# LLM Vulnerabilities
---
| Vulnerability                       | OWASP Mapping | Description                                       | LLM-Specific Mechanism                           | Impact                                  |
| ----------------------------------- | ------------- | ------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| Prompt Injection                    | LLM01         | Malicious instructions override system behavior   | Injected text in prompts, webpages, or documents | Policy bypass, unauthorized actions     |
| Indirect Prompt Injection           | LLM01         | Hidden instructions in external data sources      | RAG content, PDFs, web pages influencing model   | Stealth control of outputs              |
| Jailbreaking                        | LLM01 / LLM07 | Bypassing safety alignment rules                  | Role-play, obfuscation, multi-turn persuasion    | Restricted content generation           |
| System Prompt Leakage               | LLM07         | Exposure of hidden system/developer prompts       | “Repeat instructions above” attacks              | Loss of control/security logic          |
| Context Window Injection            | LLM01         | Hidden malicious instructions inside long context | Large documents overriding earlier rules         | Silent behavioral manipulation          |
| Retrieval Poisoning (RAG Attack)    | LLM08         | Poisoning external knowledge base                 | Malicious embeddings or documents in vector DB   | Wrong or manipulated responses          |
| Data Extraction (Memorization Leak) | LLM02         | Extracting training or sensitive data             | Targeted prompting to retrieve memorized content | Privacy leakage                         |
| Membership Inference                | LLM02         | Detecting if data was in training set             | Confidence probing, response pattern analysis    | Privacy violation                       |
| Model Inversion                     | LLM02         | Reconstructing original private data              | Query-based reconstruction attacks               | Sensitive data recovery                 |
| Tool / Function Call Manipulation   | LLM06         | Misuse of external tools or APIs                  | Prompt forces unsafe function execution          | Data exfiltration, unauthorized actions |
| Excessive Agency Exploitation       | LLM06         | Over-permissioned autonomous systems              | Agent performs actions beyond intended scope     | Financial/data/system damage            |
| Output Handling Vulnerabilities     | LLM05         | Unsafe downstream processing of outputs           | Injected SQL/HTML/code from model output         | XSS, SQL injection, command injection   |
| Token Smuggling                     | LLM01         | Hidden instructions in encoded formats            | Base64, Unicode tricks, formatting bypass        | Safety filter evasion                   |
| Multi-turn Jailbreak                | LLM01         | Gradual manipulation across conversations         | Step-by-step trust building                      | Policy bypass over time                 |
| Prompt Chaining Attack              | LLM01         | Splitting malicious intent into safe steps        | Each prompt appears harmless individually        | Combined harmful outcome                |
| Instruction Hierarchy Confusion     | LLM01         | Conflicting system/user/context rules             | Ambiguity in priority of instructions            | Unpredictable or unsafe outputs         |
| Hallucination Exploitation          | LLM09         | Leveraging false but confident outputs            | Model fabricates answers under uncertainty       | Misinformation propagation              |
| Bias Exploitation                   | LLM09         | Triggering learned biases in outputs              | Leading or framed prompts                        | Harmful or discriminatory content       |
| Overlong Context Degradation        | LLM10         | Performance degradation in long inputs            | Attention dilution across large context          | Missed constraints or errors            |
| Unbounded Resource Consumption      | LLM10         | Forcing excessive computation or loops            | Recursive prompts or tool loops                  | Cost explosion / denial of service      |
| Data Poisoning (Training/Fine-tune) | LLM03 / LLM04 | Corrupting training or tuning data                | Injected malicious dataset entries               | Persistent harmful model behavior       |
| Supply Chain Model Attack           | LLM03         | Vulnerabilities in third-party models/tools       | External APIs, plugins, model weights            | Backdoors or compromised behavior       |
