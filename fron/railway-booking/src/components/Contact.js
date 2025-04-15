import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './ContactUs.css';

const ContactUs = () => {
  const contactItems = [
    {
      icon: <FiMail className="contact-icon" />,
      title: "Email",
      content: "metro@gmail.com",
      href: "mailto:metro@gmail.com",
      delay: 0.1
    },
    {
      icon: <FiPhone className="contact-icon" />,
      title: "Phone",
      contacts: [
        { label: "Metro train Manager", number: "+91 9999999999" },
        { label: "Metro Booking manager", number: "+91 8888888888" }
      ],
      delay: 0.2
    },
    {
      icon: <FiMapPin className="contact-icon" />,
      title: "Address",
      content: "NITK, NH 66, Srinivasnagar, Surathkal Mangalore, Karnataka - 575025",
      href: "https://maps.google.com/?q=NITK+Surathkal",
      delay: 0.3
    }
  ];

  return (
    <div className="contact-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="contact-card"
      >
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="section-title"
        >
          Contact Us
        </motion.h2>
        
        <div className="contact-grid">
          {contactItems.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.5 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px rgba(255, 255, 255, 0.05)"
              }}
              className="contact-item"
            >
              <div className="contact-header">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  {item.icon}
                </motion.div>
                <h3>{item.title}</h3>
              </div>
              
              {item.content ? (
                <a href={item.href} className="contact-content">
                  {item.content} <FiExternalLink className="external-icon" />
                </a>
              ) : (
                <div className="contact-phones">
                  {item.contacts.map((contact, i) => (
                    <div key={i} className="phone-item">
                      <p className="phone-label">{contact.label}</p>
                      <a href={`tel:${contact.number.replace(/\s+/g, '')}`} className="phone-number">
                        {contact.number}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;