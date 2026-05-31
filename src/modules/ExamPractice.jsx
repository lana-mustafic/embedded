import { useState } from 'react';
import {
  generateExamQuestion,
  APPROACH_LABELS,
} from '../data/examQuestions';
import CodeBlock from '../components/CodeBlock';

export default function ExamPractice() {
  const [question, setQuestion] = useState(() => generateExamQuestion());
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const newQuestion = () => {
    setQuestion(generateExamQuestion());
    setSelected(null);
    setSubmitted(false);
  };

  const submit = () => {
    if (selected) setSubmitted(true);
  };

  const correct = submitted && selected === question.correct;

  return (
    <section className="module">
      <header className="module-header">
        <h2>Exam Practice Mode</h2>
        <p>
          Random exam-style prompts. Pick the best RTOS approach, then read the
          explanation and pseudocode.
        </p>
      </header>

      <div className="card exam-card">
        <p className="exam-prompt">{question.prompt}</p>

        <div className="exam-options">
          {question.options.map((opt) => {
            const label = APPROACH_LABELS[opt];
            let cls = 'exam-opt';
            if (submitted) {
              if (opt === question.correct) cls += ' opt-correct';
              else if (opt === selected) cls += ' opt-wrong';
            } else if (selected === opt) cls += ' opt-selected';

            return (
              <button
                key={opt}
                type="button"
                className={cls}
                disabled={submitted}
                onClick={() => setSelected(opt)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="transport">
          {!submitted ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selected}
              onClick={submit}
            >
              Check answer
            </button>
          ) : (
            <div className={`result-banner ${correct ? 'result-ok' : 'result-bad'}`}>
              {correct
                ? 'Correct — good choice for this scenario.'
                : `Not quite. Best approach: ${APPROACH_LABELS[question.correct]}.`}
            </div>
          )}
          <button type="button" className="btn btn-secondary" onClick={newQuestion}>
            New question
          </button>
        </div>

        {submitted && (
          <div className="exam-feedback">
            <h3>Explanation</h3>
            <p>{question.explanation}</p>
            <CodeBlock title="Model pseudocode" code={question.pseudocode} />
          </div>
        )}
      </div>
    </section>
  );
}
