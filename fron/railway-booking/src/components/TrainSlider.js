// src/components/TrainSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './TrainSlider.css';

const TrainSlider = () => {
  const images = [
    {
      url: '/1.png',
      caption: 'Modern High-Speed Train',
    },
    {
      url: '/2.png',
      caption: 'Classic Steam Engine',
    },
    {
      url: '/3.png',
      caption: 'Train Passing through Mountains',
    },
  ];

  return (
    <div className="train-slider-wrapper">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        speed={800}
        className="train-slider"
      >
        {images.map((image, idx) => (
          <SwiperSlide key={idx}>
            <div className="slide-content">
              <img 
                src={image.url} 
                alt={`Slide ${idx + 1}`} 
                loading="lazy"
              />
              <div className="caption">{image.caption}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TrainSlider;