"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const projects = [
  {
    img: "/assets/img/blog/project1.jpg",
    tag: "Care Plus",
    title: "Wellness Begins with Us",
    delay: 0.4,
  },
  {
    img: "/assets/img/blog/project2.jpg",
    tag: "Renew Health Center",
    title: "Quality health close to home",
    delay: 0.5,
  },
  {
    img: "/assets/img/blog/project3.jpg",
    tag: "Wellness Oasis",
    title: "A healthy tomorrow starts today",
    delay: 0.6,
  },
  {
    img: "/assets/img/blog/project4.jpg",
    tag: "Revive Medical Care",
    title: "Caring for you every step of the way",
    delay: 0.7,
  },
];

const Project = () => {
  return (
    <section className="project-section space-bottom fix space-top">
      <div className="container">
        <div className="section-title text-center mb-60">
          <span className="cmn-tag p1-bg heading-font">Latest Project</span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="black visible-slowly-right"
          >
            Healing Lives One Patient <br /> at Time Trusted
            <span className="position-relative z-1">
              {" "}Results{" "}
              <img 
                src="/assets/img/element/title-badge1.png" 
                alt="img"
                className="title-badge1 d-md-block d-none w-100" 
              />
            </span>
          </motion.h2>
        </div>
        <div className="row g-xs-lg-4 g-xs-3 gy-xxl-5 gy-4 justify-content-center">
          {projects.map((proj, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: proj.delay }}
              viewport={{ once: true }}
              className="col-lg-6 col-md-6 col-sm-6"
            >
              <div className="project-items position-relative">
                <div className="project-thumb d-center position-relative rounded-4 overflow-hidden mb-4">
                  <img src={proj.img} alt="img" className="w-100 rounded-4" />
                  <Link href="/project-details" className="project-arrws p1-bg d-center rounded-circle">
                    <img src="/assets/img/icon/arrow-right-black.png" alt="icon" />
                  </Link>
                </div>
                <div className="cont">
                  <span className="pra fs-seven fw_500 d-block visible-slowly-right mb-2">{proj.tag}</span>
                  <h4>
                    <Link href="/project-details" className="black fw_700">
                      {proj.title}
                    </Link>
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Project;
