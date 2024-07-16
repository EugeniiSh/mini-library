class Slider
{
  constructor({slider, visibleNum = 1, autoScroll = true, paginations = true, arrows = true})
  {
    this.slider = slider; //Объект slider-container
    this.visibleNum = visibleNum; //Количество одновременно видимых слайдов
    this.autoScroll = autoScroll; //Вкл-Откл автопролистывания слайдера
    this.paginations = paginations; //Вкл-Откл пагинанацию для слайдера
    this.arrows = arrows; //Вкл-Откл стрелок влево-вправо
    this.setup(this.slider); //Обновление текущих значений слайдера
    this.attachEvents();
  }

  setup(slider) 
  {
    this.position = 0; //Текущая позиция слайдера
    this.pagIndex = 0; //Текущая позиция пагинации

    this.sliderLine = slider.querySelector('.slider-line'); //Движущаяся линия слайдера
    this.sliderPaginationBlock = slider.querySelector('.slider-block__pagination'); //Блок для пагинаций

    this.sliderWrapperWidth = slider.querySelector('.slider-block__wrapper').offsetWidth; //Ширина неподвижного окна просмотра
    this.sliderLineWidth = slider.querySelector('.slider-line').scrollWidth; //Ширина всей прокручиваемой линии слайдера
    this.lineItemWidth = slider.querySelector('.slider-line__item').offsetWidth; //Ширина одного элемента линии слайдера
    this.lineItemsNumber = slider.querySelectorAll('.slider-line__item').length; //Количество элементов в линии слайдера
    this.scrollLength = this.lineItemWidth + ((this.sliderLineWidth - (this.lineItemWidth * this.lineItemsNumber)) / (this.lineItemsNumber - 1)); //Длина прокрутки линии слайдера

    this.posX1 = 0; //Координаты начала касания
    this.posX2 = 0; //Координаты конца касания
    this.swipeLength = 0; //Длинна касания
    this.swipeThreshold = this.sliderWrapperWidth / 3; //Длинна касания достаточная для свайпа

    this.createPaginations();
    this.goToSlide(this.pagIndex);

    if(!this.paginations)                    //Скрытие блока пагинации при включённой настройке,
    {                                        //но автопереключение будет продолжаться.
      this.sliderPaginationBlock.classList.add('hiden-block');
    }

    if(!this.arrows)
    {
      this.slider.querySelector('.slider__arrow-left').classList.add('hiden-block');
      this.slider.querySelector('.slider__arrow-right').classList.add('hiden-block');
      this.slider.style.justifyContent = 'center';
    }
  }

  createPaginations() //Создание блоков пагинации
  {
    const pagNum = (this.lineItemsNumber - this.visibleNum) + 1; //Количество пагинации в зависимости от количества одновременно видимых слайдов
    const pagNode = document.createElement('div');
    pagNode.className = 'pagination-block';
    pagNode.innerHTML = '<div class="pagination-block__filler"></div>';
    this.sliderPaginationBlock.innerHTML = '';

    for(let i = 0; i < pagNum; i++)
    {
      this.sliderPaginationBlock.append(pagNode.cloneNode(true));
    }

    this.paginationBlocks = slider.querySelectorAll('.pagination-block'); //Все блоки пагинации

    this.paginationBlocks.forEach((item, index) => 
    {                                        
      item.addEventListener('animationend', () => //Установка события на конец анимации пагинации,
      {                                           //для автоматического переключения на следующий слайд
        this.nextSlide();
      });

      item.addEventListener('click', () => //Установка события на переключение слайдов,
      {                                    //при нажатии на пагинацию
        this.goToSlide(index);
      });
    });
  }

  goToSlide(num) 
  {
    this.position = this.scrollLength * num;
    this.pagIndex = num;
    this.sliderLine.style.transform = `translateX(${-this.position}px)`;
    this.activatePagination();
  }

  nextSlide() 
  {
    if(this.position < ((this.lineItemsNumber - this.visibleNum) * this.scrollLength))
    {
      this.position += this.scrollLength;
      this.pagIndex++;
    }
    else
    {
      this.position = 0;
      this.pagIndex = 0;
    }

    this.sliderLine.style.transform = `translateX(${-this.position}px)`;
    this.activatePagination();
  }

  prevSlide() 
  {
    if(this.position > 0)
    {
      this.position -= this.scrollLength;
      this.pagIndex--;
    }
    else
    {
      this.position = (this.lineItemsNumber - this.visibleNum) * this.scrollLength;
      this.pagIndex = this.lineItemsNumber - this.visibleNum;
    }

    this.sliderLine.style.transform = `translateX(${-this.position}px)`;
    this.activatePagination();
  }

  activatePagination() //Активация пагинации
  {
    if(this.autoScroll) // анимированная авто пагинация
    {
      this.paginationBlocks.forEach((item) =>                            //Берём все блоки пагинации;
      {                                                                  //Удаляем стиль анимации для каждого;
        item.firstChild.classList.remove('activ-pagination-animation');  //Для пагинации актуального слайда
      })                                                                 //добавляем стиль анимации;   
      this.paginationBlocks[this.pagIndex].firstChild.classList.add('activ-pagination-animation');
    }
    else // не анимированная статичная пагинация
    {
      this.paginationBlocks.forEach((item) =>                  //Берём все блоки пагинации;
      {                                                        //Удаляем стиль активации для каждого;
        item.firstChild.classList.remove('activ-pagination');  //Для пагинации актуального слайда
      })                                                       //добавляем стиль активации;   
      this.paginationBlocks[this.pagIndex].firstChild.classList.add('activ-pagination');
    }
  }

  attachEvents() 
  {
    const arrowLeft = this.slider.querySelector('.arrow-left__block');
    const arrowRight = this.slider.querySelector('.slider__arrow-right');

    arrowLeft.addEventListener('click', () => this.prevSlide()); //Переключение слайдера влево
    arrowRight.addEventListener('click', () => this.nextSlide());//Переключение слайдера вправо

    this.sliderLine.addEventListener('touchstart', (event) => //Установка события на начало касания
    {
      this.posX1 = event.changedTouches[0].clientX; //Координаты начала касания по оси Х

      const activPagination = this.slider.querySelector('.activ-pagination-animation'); //Текущая активная пагинация
      activPagination.style.animationPlayState = 'paused'; //Ставим анимацию на паузу
    });

    this.sliderLine.addEventListener('touchend', (event) => //Установка события на конец касания
    {
      this.posX2 = event.changedTouches[0].clientX; //Координаты конца касания по оси Х
      this.swipeAction();
  
      this.removePausePagination();
    });

    this.sliderLine.addEventListener('mousedown', (event) => //Установка события на зажатие кнопки мыши (левой)
    {
      this.posX1 = event.clientX; //Координаты клика по оси Х
    });
      
    this.sliderLine.addEventListener('mouseup', (event) => //Установка события на отпускание кнопки мыши (левой)
    {
      this.posX2 = event.clientX; //Координаты отжатия кнопки по оси Х
      this.swipeAction();
    });
  }

  swipeAction()
  {
    this.swipeLength = this.posX1 - this.posX2; //Определение длинны свайпа

    if(Math.abs(this.swipeLength) > this.swipeThreshold) //Сравнение с необходимой длинной свайпа, 
    {                                                    //для прокрутки слайдера
      if(this.swipeLength > 0) this.nextSlide(); //Положительное число => свайп вправо
      if(this.swipeLength < 0) this.prevSlide(); //Отрицательное число => свайп влево
    }
  }

  removePausePagination() //Очистка стилей для завершения паузы анимации
  {
    this.paginationBlocks.forEach((item) =>
    {
      item.firstChild.style = '';
    })
  }
}


const slider = document.querySelector('.slider-container');

const sliderSetup = 
{
  slider: slider,
  visibleNum: 2,
  autoScroll: false,
  paginations: true,
  arrows: true,
}

const sliderObj = new Slider(sliderSetup);
// console.log(sliderObj);


// Разметка:
// Стандартная разметка находится в файле index.html, блок "slider-container" и всё его содержимое.
// Вы можите добавлять свой контент в блоки:
// - arrow-left__block
// - arrow-right__block
// - line-item__block
// - Добавление контента в другие блоки на свой страх и риск.

// Стили:
// Стандартные стили находятся в файле style.css и начинаются с 22-й строки, после слов "Стандартные стили для слайдера".
// - Размер и цвет блоков можно менять на своё усмотрение.
// - Изменить время автоперелистывания - в .activ-pagination-animation заменить цифру 5, на нужную вам (в секундах)
// - Другие стили можно менять если уверены в себе.

// JavaScript:
// Весь код JS находится в файле main.js.

// Установка:
// Для установки слайдера нужно сделать следующее:
// 1. Скопировать разметку, стили и код в свой проект.
// 2. В файле с кодом JS, ниже скопированного кода:
//  - создать переменную для слайдера (например  - slider),
//    и использовать  document.querySelector('.slider-container') что бы найти его в DOM.
//  - создать переменную для объекта настроек (например: sliderSetup),
//    в котором нужно указать следующие параметры:
// 
//        (имена параметров должны строго соответствовать приведённым ниже)
//        (все параметры, кроме slider, не обязательные)
//     -- slider = объект слайдера (например slider, из пункта выше)
//     -- visibleNum = любое целое число.
//      Настраивает количество одновременно видимых элементов слайдера. По умолчанию = 1.
//     -- autoScroll = булевый тип.
//      Вкл-Откл автопролистывания слайдера. По умолчанию = true.
//     -- paginations = булевый тип.
//       Вкл-Откл пагинанацию для слайдера. По умолчанию = true.
//     -- arrows = булевый тип.
//      Вкл-Откл стрелок влево-вправо. По умолчанию = true.
// 
//  - создать переменную для объекта слайдера (например - sliderObj),
//    и использовать конструкцию sliderObj = new Slider(sliderSetup) для инициализации слайдера.
//  - Слайдер готов к работе.

// Для адаптации слайдера можно использовать фукцию: 
window.addEventListener('resize',(e) => 
{
  // Здесь меняете стили слайдера
  // После обязательно переинициализируете с помощью sliderObj.setup(slider - переменная для слайдера из DOM)
  sliderObj.setup(slider);
});
      

