// src/components/TrainSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './TrainSlider.css'; // optional for styling

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
    <div className="train-slider">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        className="mySwiper"
      >
        {images.map((image, idx) => (
          <SwiperSlide key={idx}>
            <div className="slide-content">
              <img src={image.url} alt={`Slide ${idx + 1}`} />
              <div className="caption">{image.caption}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TrainSlider;
