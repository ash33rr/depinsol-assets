       const swiperPartners = new Swiper('.swiper-partners', {
            slidesPerView: 2,
            spaceBetween: 16,
            loop: true,
            autoplay: {
                delay: 1500,
                disableOnInteraction: false,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
            },
        });

        const swiperClients = new Swiper('.swiper-clients', {
     slidesPerView: 2,
            spaceBetween: 16,
            loop: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.clients__arrow--next',
                prevEl: '.clients__arrow--prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
            },
        });
