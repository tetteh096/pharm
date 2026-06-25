"use client";

import React from "react";

const MARQUEE_ITEMS = [
  { type: "text" as const, value: "Quality Care Service" },
  { type: "icon" as const },
  { type: "text" as const, value: "Your Wellness Priority" },
  { type: "icon" as const },
  { type: "text" as const, value: "Caring for You Always" },
  { type: "icon" as const },
];

const trackStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  width: "max-content",
};

const itemRowStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  flexShrink: 0,
};

function MarqueeItems() {
  return (
    <>
      {MARQUEE_ITEMS.map((item, index) =>
        item.type === "text" ? (
          <span key={`t-${index}`} className="sponsor-marquee__text">
            {item.value}
          </span>
        ) : (
          <img
            key={`i-${index}`}
            src="/assets/img/icon/star-text.png"
            alt=""
            className="sponsor-marquee__star"
          />
        )
      )}
    </>
  );
}

const Sponsor = () => {
  return (
    <section className="sponsor-marquee white-bg" aria-label="Pharmacy care highlights">
      <div className="sponsor-marquee__viewport">
        <div className="sponsor-marquee__track" style={trackStyle}>
          <div className="sponsor-marquee__group" style={itemRowStyle}>
            <MarqueeItems />
          </div>
          <div className="sponsor-marquee__group" style={itemRowStyle} aria-hidden>
            <MarqueeItems />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsor;
