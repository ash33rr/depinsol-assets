

        const swiperClients = new Swiper('.swiper-clients', {
     slidesPerView: 2,
            spaceBetween: 16,
            loop: true,
            grabCursor: true,
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

     const swiperHero = new Swiper(".heroSwiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                grabCursor: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".hero-swiper-button--next",
                    prevEl: ".hero-swiper-button--prev",
                },
            });
