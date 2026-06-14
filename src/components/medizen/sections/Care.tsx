"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useInView } from "framer-motion";

import { pharmacyStats } from "@/data/pharmacy-stats";

const CounterItem = ({ target, label, delay, suffix = "" }: { target: number, label: string, delay: number, suffix?: string }) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, target, {
      duration: 3.5,
      delay: delay,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [isInView, target, delay]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      ref={ref}
      className="counter-items box-style first-box"
    >
      <div className="content">
        <h2><span>{displayValue}</span>{suffix}+</h2>
        <p className="black">{label}</p>
      </div>
    </motion.div>
  );
};

const Care = () => {
  return (
    <section className="care-counter fix">
      <div className="container">
        <div className="care-counter-wrap">
          <div className="row g-4 justify-content-center">
            <div className="col-lg-5">
              <div className="care-counter-text">
                <h3 className="black fw_700 visible-slowly-right">Reliable Medicine <br /> Trusted Care</h3>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="care-counter">
                {pharmacyStats.map((stat, i) => (
                  <CounterItem
                    key={stat.label}
                    target={stat.value}
                    label={stat.label}
                    delay={0.4 + i * 0.1}
                    suffix={stat.suffix}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Care;
