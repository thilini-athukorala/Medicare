
import { useEffect, useState } from 'react';
import './HeroSlider.css';

const slides = [
  {
    image: '/images/banner1.jpg',
    title: 'Your Health, Our Priority',
    description: 'Quality healthcare made simple and accessible.'
  },
  {
    image: '/images/banner2.jpg',
    title: 'Find the Right Doctor',
    description: 'Connect with healthcare professionals easily.'
  },
  {
    image: '/images/banner3.jpg',
    title: 'Book Appointments Online',
    description: 'Choose your doctor, date and time in a few clicks.'
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const previous = () => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`hero-slide ${index === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={index !== current}
        >
          <div className="hero-slide-overlay">
            {index === current && (
              <div className="hero-slide-content">
                <span>MEDICARE HEALTHCARE</span>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <a href="/doctors" className="hero-slide-button">
                  Find Doctors →
                </a>
              </div>
            )}
          </div>
        </div>
      ))}

      <button className="slider-prev" onClick={previous} aria-label="Previous slide">
        &#10094;
      </button>

      <button className="slider-next" onClick={next} aria-label="Next slide">
        &#10095;
      </button>

      <div className="slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            className={current === index ? 'active' : ''}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={current === index ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
