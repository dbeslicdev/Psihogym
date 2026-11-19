import React from 'react';
import { Hero, Team, Facts, Myths, Fit, Closing } from './PreviewContent.jsx';
import './dialogue.css';

export function Dialogue() {
  return (
    <div className="sv-dialogue">
      <div className="dialogue-width">
        <div className="dialogue-exchange">
          <header className="dialogue-opening"><Hero /></header>
          <section className="dialogue-team" id="timski-rad"><Team /></section>
        </div>
        <section className="dialogue-facts" id="vazno"><Facts /></section>
      </div>
      <div className="dialogue-middle">
        <section className="dialogue-myths dialogue-width" id="mitovi"><Myths /></section>
      </div>
      <div className="dialogue-width">
        <section className="dialogue-fit" id="za-tebe"><Fit /></section>
        <section className="dialogue-close" id="kontakt"><Closing /></section>
      </div>
    </div>
  );
}

export function Notebook() {
  return (
    <div className="sv-notebook">
      <div className="notebook-sheets">
        <div className="notebook-spread notebook-opener">
          <header className="notebook-intro notebook-page"><Hero /></header>
          <section className="notebook-right notebook-page notebook-team" id="timski-rad">
            <img src="/playground/journal.webp" width="1200" height="800" alt="Ivana lista stručnu literaturu." />
            <Team />
          </section>
        </div>
        <div className="notebook-spread notebook-reading">
          <section className="notebook-page notebook-facts" id="vazno"><Facts /></section>
          <section className="notebook-page notebook-right notebook-myths" id="mitovi"><Myths /></section>
        </div>
        <div className="notebook-spread notebook-end">
          <section className="notebook-page notebook-fit" id="za-tebe"><Fit /></section>
          <section className="notebook-page notebook-right notebook-close" id="kontakt"><Closing /></section>
        </div>
      </div>
    </div>
  );
}

