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
        <h2>Vježba za ispit</h2>
        <p>
          Nasumična pitanja u stilu ispita. Odaberi najbolji RTOS pristup, zatim
          pročitaj objašnjenje i pseudokod.
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
              Provjeri odgovor
            </button>
          ) : (
            <div className={`result-banner ${correct ? 'result-ok' : 'result-bad'}`}>
              {correct
                ? 'Točno — dobar izbor za ovaj scenarij.'
                : `Nije točno. Najbolji pristup: ${APPROACH_LABELS[question.correct]}.`}
            </div>
          )}
          <button type="button" className="btn btn-secondary" onClick={newQuestion}>
            Novo pitanje
          </button>
        </div>

        {submitted && (
          <div className="exam-feedback">
            <h3>Objašnjenje</h3>
            <p>{question.explanation}</p>
            <CodeBlock title="Uzorak pseudokoda" code={question.pseudocode} />
          </div>
        )}
      </div>
    </section>
  );
}
