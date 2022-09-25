
var popup = {

    /**
     * @returns {Promise<void>}
     */
    init: async function () {

        let storage   = await tools.getStorage();
        let activeTab = storage.hasOwnProperty('active_tab') && storage.active_tab ? storage.active_tab : '';

        if (activeTab && $(activeTab)[0]) {
            let tab = new mdb.Tab($('a[href="' + activeTab + '"]')[0]);
            tab.show();
        }

        $('a[data-mdb-toggle="tab"]').each(function (key, tab) {
            tab.addEventListener('shown.mdb.tab', (event) => {
                tools.setStorage('active_tab', $(event.target).attr('href'));
            })
        });


        popup.lists.init(storage);
        popup.page.init(storage);
        popup.test.init(storage);


        if (window.opener && window.opener !== window) {
            $('#btn-open-window').hide();
        }

        /**
         * Обработка сообщений
         */
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

            if (message.hasOwnProperty('action') && message.action) {
                switch (message.action) {
                    case 'selectElement': popup.selectElement(message.data, sender, sendResponse); break;
                }
            }
        });


        $('#btn-open-window').click(popup.openWindow);
        $('#btn-options').click(popup.openOptions);

        $('#btn-clear-all').click(function () {
            if (confirm("Очистить все поля?")) {
                $('.form-control').val('')
                    .removeClass('active')
                    .trigger('change');

                tools.clearStorage();
            }
        });
    },


    /**
     * Таб со списками
     */
    lists: {

        /**
         * @param storage
         */
        init: function (storage) {

            let sourceTitle    = $('#source-title');
            let sourceTags     = $('#source-tags');
            let sourceRegion   = $('#source-region');
            let sourceStartUrl = $('#source-start_url');

            let sourceTitleVal    = storage.hasOwnProperty('source_title') && storage.source_title ? storage.source_title : '';
            let sourceTagsVal     = storage.hasOwnProperty('source_tags') && storage.source_tags ? storage.source_tags : '';
            let sourceRegionVal   = storage.hasOwnProperty('source_region') && storage.source_region ? storage.source_region : '';
            let sourceStartUrlVal = storage.hasOwnProperty('source_start_url') && storage.source_start_url ? storage.source_start_url : '';


            if (sourceTitleVal) {    sourceTitle.val(sourceTitleVal).addClass('active').trigger('change'); }
            if (sourceTagsVal) {     sourceTags.val(sourceTagsVal).addClass('active').trigger('change'); }
            if (sourceRegionVal) {   sourceRegion.val(sourceRegionVal).addClass('active').trigger('change'); }
            if (sourceStartUrlVal) { sourceStartUrl.val(sourceStartUrlVal).addClass('active').trigger('change'); }

            sourceTitle.change(function () {    tools.setStorage('source_title', $(this).val()); });
            sourceTags.change(function () {     tools.setStorage('source_tags', $(this).val()); });
            sourceRegion.change(function () {   tools.setStorage('source_region', $(this).val()); });
            sourceStartUrl.change(function () { tools.setStorage('source_start_url', $(this).val()); });

            popup.lists._initControls(storage);
        },


        /**
         * @param storage
         * @private
         */
        _initControls: function (storage) {

            $('#btn-source-title').click(function () {
                tools.getCurrentTab().then(function (tab) {
                    let result = tab.url.match(/((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])/);
                    let domain = result[0] || '';
                    domain = domain.replace(/^www./, '');

                    $('#source-title').val(domain)
                        .addClass('active')
                        .trigger('change');
                });
            });

            $('.dropdown-tags button').click(function () {
                let currentText = $('#source-tags').val();

                if (currentText === '') {
                    $('#source-tags').val($(this).text());
                } else {
                    $('#source-tags').val(currentText + ', ' + $(this).text());
                }

                $('#source-tags').addClass('active').trigger('change');
            });

            $('.dropdown-regions button').click(function () {
                $('#source-region').val($(this).text())
                    .addClass('active')
                    .trigger('change');
            });

            $('#btn-source-start_url').click(function () {
                tools.getCurrentTab().then(function (tab) {
                    $('#source-start_url').val(tab.url)
                        .addClass('active')
                        .trigger('change');
                });
            });


            let listKey   = 1;
            let lists     = storage.hasOwnProperty('lists') && storage.lists ? storage.lists : [];
            let listFirst = typeof lists === 'object' && lists.length > 0 && lists[0]
                ? lists[0]
                : '';

            // Обработка кнопок (выбор формата даты и стрелочек)

            _addList(listFirst, true);

            $.each(lists, function (key, listValues) {
                if (key !== 0 && listValues) {
                    _addList(listValues, true);
                }
            });

            $('#list-1 .form-control').change(_changeList);
            $('#btn-list-add').click(function () {
                _addList({}, false);
            });


            /**
             * @param values
             * @param isCollapsed
             * @private
             */
            function _addList(values, isCollapsed) {

                let collapseClass    = isCollapsed ? '' : 'show';
                let collapseClassBtn = isCollapsed ? 'collapsed' : '';

                let btnDelete =
                    '<br>' +
                    '<button class="btn btn-sm btn-warning float-end btn-list-remove">' +
                        '<i class="fa fa-remove"></i> Удалить' +
                    '</button>';

                let tpl =
                    '<div class="accordion-item">' +
                        '<h2 class="accordion-header">' +
                            '<button class="accordion-button ' + collapseClassBtn + '" type="button" data-mdb-toggle="collapse" data-mdb-target="#list-' + listKey + '">' +
                                '<i class="fa-solid fa-circle me-2"></i> Список новостей #' + listKey +
                            '</button>' +
                        '</h2>' +
                        '<div id="list-'+ listKey +'" class="accordion-collapse collapse ' + collapseClass + '" data-mdb-parent="#accordion-list">' +
                            '<div class="accordion-body">' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list-items">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<textarea class="form-control form-control-sm source-list-items" id="source-list_'+ listKey +'-items" rows="4" required></textarea>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-items">Блок с новостью</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_url">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-url" class="form-control form-control-sm source-list-url" required placeholder="Пусто если является контейнером"/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-url">Ссылка</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_title">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-title" class="form-control form-control-sm source-list-title" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-title">Заголовок</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_date_publish">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-date_publish" class="form-control form-control-sm source-list-date_publish" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-date_publish">Дата публикации</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_count_views">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-count_views" class="form-control form-control-sm source-list-count_views" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-count_views">Количество просмотров</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_region">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-region" class="form-control form-control-sm source-list-region" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-region">Регион</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_category">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-category" class="form-control form-control-sm source-list-category" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-category">Раздел / категория</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_tags">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-tags" class="form-control form-control-sm source-list-tags" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-tags">Теги</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1">' +
                                        '<button type="button" class="btn btn-sm btn-secondary float-end btn-source-list_description">' +
                                            '<i class="fa-solid fa-arrow-pointer fa-fw"></i>' +
                                        '</button>' +
                                    '</div>' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-description" class="form-control form-control-sm source-list-description" required/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-description">Краткое описание</label>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="d-flex">' +
                                    '<div class="p-1 w-100">' +
                                        '<div class="form-outline mb-3">' +
                                            '<input type="text" id="source-list_'+ listKey +'-date_format" class="form-control form-control-sm source-list-date_format" required placeholder="Регулярное выражение"/>' +
                                            '<label class="form-label" for="source-list_'+ listKey +'-date_format">Формат даты</label>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="p-1">' +
                                        '<div class="dropdown float-end">' +
                                            '<button class="btn btn-sm btn-secondary" type="button" data-mdb-toggle="dropdown">' +
                                                '<i class="fa-solid fa-sort-down fa-fw"></i>' +
                                            '</button>' +
                                            '<ul class="dropdown-menu dropdown-format">' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\s+(?<month_ru>[А-я]+)\\s+(?<year>[\\d]{4})~mu">dd месяц yyyy</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\s+(?<month_ru>[а-я]+)\\s+(?:(?<year>\\d{4})|(?<current_year>))~mu">dd месяц yyyy|тек-год</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\s+(?<month_ru>[а-я]+)\\s+(?<year>[\\d]{4})\\s+(?<hour>[\\d]+):(?<min>[\\d]+)~mu">dd месяц yyyy hh:ii</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\s+(?<month_ru>[а-я]+)\\s+(?:(?<year>\\d{4})|(?<current_year>))\\s+(?<hour>[\\d]+):(?<min>[\\d]+)~mu">dd месяц yyyy|тек-год hh:ii</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\s+(?<month_ru>[а-я]+)\\s+(?<year>[\\d]{4})\\s+в\\s+(?<hour>[\\d]+):(?<min>[\\d]+)~mu">dd месяц yyyy в hh:ii</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\.(?<month>\\d+)\\.(?<year>[\\d]{4})~mu">dd.mm.yyyy</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\.(?<month>\\d+)\\.(?<year>[\\d]{4})\\s+(?<hour>[\\d]{2}):(?<min>[\\d]{2})~mu">dd.mm.yyyy hh:ii</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\.(?<month>\\d+)\\.(?:(?<year>\\d{4})|(?<current_year>))\\s+(?<hour>[\\d]{2}):(?<min>[\\d]{2})~mu">dd.mm.yyyy|тек-год hh:ii</button></li>' +
                                                '<li><button class="dropdown-item" type="button" data-format="~(?<day>\\d+)\\.(?<month>\\d+)\\.(?<year>[\\d]{4})\\s+в\\s+(?<hour>[\\d]{2}):(?<min>[\\d]{2})~mu">dd.mm.yyyy в hh:ii</button></li>' +
                                            '</ul>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                (listKey === 1 ? '' : btnDelete) +
                                '<div class="clearfix"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                if ( ! isCollapsed) {
                    $('#accordion-list .accordion-button').addClass('collapsed');
                    $('#accordion-list .accordion-collapse').removeClass('show');
                }

                $('#accordion-list').append(tpl);

                let listContainer = $('#accordion-list > .accordion-item:last-child');

                if (values.items)        $('.source-list-items', listContainer).val(values.items).addClass('active').trigger('change');
                if (values.url)          $('.source-list-url', listContainer).val(values.url).addClass('active').trigger('change');
                if (values.title)        $('.source-list-title', listContainer).val(values.title).addClass('active').trigger('change');
                if (values.date_publish) $('.source-list-date_publish', listContainer).val(values.date_publish).addClass('active').trigger('change');
                if (values.count_views)  $('.source-list-count_views', listContainer).val(values.count_views).addClass('active').trigger('change');
                if (values.region)       $('.source-list-region', listContainer).val(values.region).addClass('active').trigger('change');
                if (values.category)     $('.source-list-category', listContainer).val(values.category).addClass('active').trigger('change');
                if (values.tags)         $('.source-list_tags', listContainer).val(list.tags).addClass('active').trigger('change');
                if (values.description)  $('.source-list-description', listContainer).val(values.description).addClass('active').trigger('change');
                if (values.date_format)  $('.source-list-date_format', listContainer).val(values.date_format).addClass('active').trigger('change');


                $('.btn-source-list-items', listContainer).click(function () {     });
                $('.btn-source-list-url', listContainer).click(function () {     });
                $('.btn-source-list-title', listContainer).click(function () {     });
                $('.btn-source-list-date_publish', listContainer).click(function () {     });
                $('.btn-source-list-count_views', listContainer).click(function () {     });
                $('.btn-source-list-region', listContainer).click(function () {     });
                $('.btn-source-list-category', listContainer).click(function () {     });
                $('.btn-source-list_tags', listContainer).click(function () {     });
                $('.btn-source-list-description', listContainer).click(function () {     });

                $('.dropdown-format button', listContainer).click(function () {
                    $('.source-list-date_format', listContainer).val($(this).data('format'))
                        .addClass('active')
                        .trigger('change');
                });


                let color = palette('mpn65', listKey)[listKey - 1];
                $('.accordion-button .fa-circle', listContainer).css('color', '#' + color);

                listKey++;


                $('.form-outline', listContainer).each(function () {
                    let input    = this
                    let mdbInput = new mdb.Input(this);
                    mdbInput.init();

                    // FIXME хак для актуализации размера лейбла в скрытых заполненных полях
                    setInterval(function () {
                        if ($(input).is(":visible")) {
                            mdbInput.update();
                        }
                    }, 100);
                });


                $('.form-control', listContainer).change(_changeList);
                $('.btn-list-remove', listContainer).click(function () {
                    if (confirm("Удалить этот список?")) {
                        listContainer.remove();
                        _changeList();
                    }
                });
            }


            /**
             * @private
             */
            function _changeList() {

                let lists = [];

                $('.accordion-collapse').each(function () {

                    let list = {};

                    list.items        = $('.source-list-items', this).val();
                    list.url          = $('.source-list-url', this).val();
                    list.title        = $('.source-list-title', this).val();
                    list.date_publish = $('.source-list-date_publish', this).val();
                    list.count_views  = $('.source-list-count_views', this).val();
                    list.region       = $('.source-list-region', this).val();
                    list.category     = $('.source-list-category', this).val();
                    list.tags         = $('.source-list-tags', this).val();
                    list.description  = $('.source-list-description', this).val();
                    list.date_format  = $('.source-list-date_format', this).val();

                    lists.push(list);
                })

                tools.setStorage('lists', lists);
            }
        }
    },


    /**
     * Таб со страницей
     */
    page:  {

        /**
         * @param storage
         */
        init: function (storage) {

            let pageTitle       = $('#source-page-title');
            let pageDatePublish = $('#source-page-date_publish');
            let pageContent     = $('#source-page-content');
            let pageTags        = $('#source-page-tags');
            let pageRegion      = $('#source-page-region');
            let pageCategory    = $('#source-page-category');
            let pageCountViews  = $('#source-page-count_views');
            let pageSourceUrl   = $('#source-page-source_url');
            let pageAuthor      = $('#source-page-author');
            let pageImage       = $('#source-page-image');
            let pageDateFormat  = $('#source-page-date_format');

            let pageClearAuthor  = $('#source-page-clear-author');
            let pageClearContent = $('#source-page-clear-content');

            let pageTitleVal       = storage.hasOwnProperty('page_title') && storage.page_title ? storage.page_title : '';
            let pageDatePublishVal = storage.hasOwnProperty('page_date_publish') && storage.page_date_publish ? storage.page_date_publish : '';
            let pageContentVal     = storage.hasOwnProperty('page_content') && storage.page_content ? storage.page_content : '';
            let pageTagsVal        = storage.hasOwnProperty('page_tags') && storage.page_tags ? storage.page_tags : '';
            let pageRegionVal      = storage.hasOwnProperty('page_region') && storage.page_region ? storage.page_region : '';
            let pageCategoryVal    = storage.hasOwnProperty('page_category') && storage.page_category ? storage.page_category : '';
            let pageCountViewsVal  = storage.hasOwnProperty('page_count_views') && storage.page_count_views ? storage.page_count_views : '';
            let pageSourceUrlVal   = storage.hasOwnProperty('page_source_url') && storage.page_source_url ? storage.page_source_url : '';
            let pageAuthorVal      = storage.hasOwnProperty('page_author') && storage.page_author ? storage.page_author : '';
            let pageImageVal       = storage.hasOwnProperty('page_image') && storage.page_image ? storage.page_image : '';
            let pageDateFormatVal  = storage.hasOwnProperty('page_date_format') && storage.page_date_format ? storage.page_date_format : '';

            let pageClearAuthorVal  = storage.hasOwnProperty('page_clear_author') && storage.page_clear_author ? storage.page_clear_author : '';
            let pageClearContentVal = storage.hasOwnProperty('page_clear_content') && storage.page_clear_content ? storage.page_clear_content : '';


            if (pageTitleVal)       pageTitle.val(pageTitleVal).addClass('active').trigger('change');
            if (pageDatePublishVal) pageDatePublish.val(pageDatePublishVal).addClass('active').trigger('change');
            if (pageContentVal)     pageContent.val(pageContentVal).addClass('active').trigger('change');
            if (pageTagsVal)        pageTags.val(pageTagsVal).addClass('active').trigger('change');
            if (pageRegionVal)      pageRegion.val(pageRegionVal).addClass('active').trigger('change');
            if (pageCategoryVal)    pageCategory.val(pageCategoryVal).addClass('active').trigger('change');
            if (pageCountViewsVal)  pageCountViews.val(pageCountViewsVal).addClass('active').trigger('change');
            if (pageSourceUrlVal)   pageSourceUrl.val(pageSourceUrlVal).addClass('active').trigger('change');
            if (pageAuthorVal)      pageAuthor.val(pageAuthorVal).addClass('active').trigger('change');
            if (pageImageVal)       pageImage.val(pageImageVal).addClass('active').trigger('change');
            if (pageDateFormatVal)  pageDateFormat.val(pageDateFormatVal).addClass('active').trigger('change');

            if (pageClearAuthorVal)  pageClearAuthor.val(pageClearAuthorVal).addClass('active').trigger('change');
            if (pageClearContentVal) pageClearContent.val(pageClearContentVal).addClass('active').trigger('change');

            pageTitle.change(function () {       tools.setStorage('page_title',        $(this).val()); });
            pageDatePublish.change(function () { tools.setStorage('page_date_publish', $(this).val()); });
            pageContent.change(function () {     tools.setStorage('page_content',      $(this).val()); });
            pageTags.change(function () {        tools.setStorage('page_tags',         $(this).val()); });
            pageRegion.change(function () {      tools.setStorage('page_region',       $(this).val()); });
            pageCategory.change(function () {    tools.setStorage('page_category',     $(this).val()); });
            pageCountViews.change(function () {  tools.setStorage('page_count_views',  $(this).val()); });
            pageSourceUrl.change(function () {   tools.setStorage('page_source_url',   $(this).val()); });
            pageAuthor.change(function () {      tools.setStorage('page_author',       $(this).val()); });
            pageImage.change(function () {       tools.setStorage('page_image',        $(this).val()); });
            pageDateFormat.change(function () {  tools.setStorage('page_date_format',  $(this).val()); });

            pageClearAuthor.change(function () {   tools.setStorage('page_clear_author',   $(this).val()); });
            pageClearContent.change(function () {  tools.setStorage('page_clear_content',  $(this).val()); });

            popup.page._initControls(storage);
        },


        /**
         * @private
         */
        _initControls: function (storage) {

            $('#btn-source-page-title').click(function () {         popup.startSelection({ target: 'page_title' })  });
            $('#btn-source-page-date_publish').click(function () {  popup.startSelection({ target: 'date_publish' })  });
            $('#btn-source-page-content').click(function () {       popup.startSelection({ target: 'content' })  });
            $('#btn-source-page-tags').click(function () {          popup.startSelection({ target: 'tags' })  });
            $('#btn-source-page-region').click(function () {        popup.startSelection({ target: 'region' })  });
            $('#btn-source-page-category').click(function () {      popup.startSelection({ target: 'category' })  });
            $('#btn-source-page-count_views').click(function () {   popup.startSelection({ target: 'count_views' }) });
            $('#btn-source-page-source_url').click(function () {    popup.startSelection({ target: 'source_url' }) });
            $('#btn-source-page-author').click(function () {        popup.startSelection({ target: 'author' }) });
            $('#btn-source-page-image').click(function () {         popup.startSelection({ target: 'image' }) });

            $('.dropdown-page-date_format button').click(function () {
                $('#source-page-date_format').val($(this).data('format'))
                    .addClass('active')
                    .trigger('change');
            });


            let pageClearReferences = storage.hasOwnProperty('page_clear_references') && storage.page_clear_references ? storage.page_clear_references : [];
            let pageClearTags       = storage.hasOwnProperty('page_clear_tags') && storage.page_clear_tags ? storage.page_clear_tags : [];
            let pageClearCategories = storage.hasOwnProperty('page_clear_categories') && storage.page_clear_categories ? storage.page_clear_categories : [];

            let containerReferences = $('.page-clear-reject-references');
            let containerTags       = $('.page-clear-reject-tags');
            let containerCategories = $('.page-clear-reject-category');


            // Кнопка добавление контрола
            $('.btn-clear-references-add').click(function () { _addClearControl(containerReferences, 'references'); });
            $('.btn-clear-tags-add').click(function ()       { _addClearControl(containerTags, 'tags'); });
            $('.btn-clear-category-add').click(function ()   { _addClearControl(containerCategories, 'category'); });


            // изменение существующих полей
            $('.form-control', containerReferences).change(function () { _changeContent('references'); });
            $('.form-control', containerTags).change(function ()       { _changeContent('tags'); });
            $('.form-control', containerCategories).change(function () { _changeContent('category'); });

            if (typeof pageClearReferences === 'object' && pageClearReferences.length > 0 && pageClearReferences[0]) {
                $('.form-control', containerReferences).val(pageClearReferences[0]);
            }
            if (typeof pageClearTags === 'object' && pageClearTags.length > 0 && pageClearTags[0]) {
                $('.form-control', containerTags).val(pageClearTags[0]);
            }
            if (typeof pageClearCategories === 'object' && pageClearCategories.length > 0 && pageClearCategories[0]) {
                $('.form-control', containerCategories).val(pageClearCategories[0]);
            }


            // добавление контролов из хранилища
            $.each(pageClearReferences, function (key, value) {
                if (key !== 0 && value) {
                    _addClearControl(containerReferences, 'references', value);
                }
            });

            $.each(pageClearTags, function (key, value) {
                if (key !== 0 && value) {
                    _addClearControl(containerTags, 'tags', value);
                }
            });

            $.each(pageClearCategories, function (key, value) {
                if (key !== 0 && value) {
                    _addClearControl(containerTags, 'category', value);
                }
            });


            /**
             * Добавление контрола
             * @param container
             * @param fieldType
             * @param value
             * @private
             */
            function _addClearControl(container, fieldType, value) {

                value = typeof value === 'string' ? value : '';

                let tpl =
                    '<div class="d-flex">' +
                        '<div class="p-1 w-100">' +
                            '<div class="form-outline mb-3">' +
                                '<input type="text" class="form-control form-control-sm" required placeholder="Регулярное выражение" value="' + value + '"/>' +
                            '</div>' +
                        '</div>' +
                        '<div class="p-1">' +
                            '<button type="button" class="btn btn-sm btn-outline-secondary float-end btn-source-clear">' +
                                '<i class="fa-solid fa-minus fa-fw"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>';

                $(container).append(tpl);

                let controlContainer = $(' > .d-flex:last-child', container);
                new mdb.Input($('.form-outline', controlContainer)[0]).init();

                $('.form-control', controlContainer).change(function () {
                    _changeContent(fieldType);
                });

                $('.btn-source-clear', controlContainer).click(function () {
                    $(this).parent().parent().remove();
                    _changeContent(fieldType);
                });
            }


            /**
             * Изменение содержимого контрола
             * @private
             */
            function _changeContent (fieldType) {

                switch (fieldType) {
                    case 'references':
                        let references = [];

                        $('.form-control', containerReferences).each(function () {
                            let value = $(this).val();
                            if (value) {
                                references.push(value)
                            }
                        });

                        tools.setStorage('page_clear_references', references)
                        break;

                    case 'tags':
                        let tags = [];

                        $('.form-control', containerTags).each(function () {
                            let value = $(this).val();
                            if (value) {
                                tags.push(value)
                            }
                        });

                        tools.setStorage('page_clear_tags', tags);
                        break;

                    case 'category':
                        let categories = [];

                        $('.form-control', containerCategories).each(function () {
                            let value = $(this).val();
                            if (value) {
                                categories.push(value)
                            }
                        });

                        tools.setStorage('page_clear_categories', categories);
                        break;
                }
            }
        }
    },


    /**
     * Таб с проверками
     */
    test: {

        /**
         * @param storage
         */
        init: function (storage) {

        }
    },


    /**
     * @param data
     * @param sender
     * @param sendResponse
     * @returns {Promise<void>}
     */
    selectElement: async function (data, sender, sendResponse) {

        let path = data.hasOwnProperty('pathOptimize') && data.pathOptimize
            ? data.pathOptimize
            : data.selected.css;

        switch (data.target) {
            case 'page_title':
                tools.setStorage('page_title', path);
                $('#source-page-title').val(path).addClass('active').trigger('change');
                break;
            case 'date_publish':
                tools.setStorage('date_publish', path);
                $('#source-page-date_publish').val(path).addClass('active').trigger('change');
                break;
            case 'content':
                tools.setStorage('content', path);
                $('#source-page-content').val(path).addClass('active').trigger('change');
                break;
            case 'tags':
                tools.setStorage('tags', path);
                $('#source-page-tags').val(path).addClass('active').trigger('change');
                break;
            case 'region':
                tools.setStorage('region', path);
                $('#source-page-region').val(path).addClass('active').trigger('change');
                break;
            case 'category':
                tools.setStorage('category', path);
                $('#source-page-category').val(path).addClass('active').trigger('change');
                break;
            case 'count_views':
                tools.setStorage('count_views', path);
                $('#source-page-count_views').val(path).addClass('active').trigger('change');
                break;
            case 'source_url':
                tools.setStorage('source_url', path);
                $('#source-page-source_url').val(path).addClass('active').trigger('change');
                break;
            case 'author':
                tools.setStorage('author', path);
                $('#source-page-author').val(path).addClass('active').trigger('change');
                break;
            case 'image':
                tools.setStorage('image', path);
                $('#source-page-image').val(path).addClass('active').trigger('change');
                break;
            case 'clear-author':
                tools.setStorage('clear-author', path);
                $('#source-page-clear-author').val(path).addClass('active').trigger('change');
                break;
            case 'clear-content':
                tools.setStorage('clear-content', path);
                $('#source-page-clear-content').val(path).addClass('active').trigger('change');
                break;
        }
    },


    /**
     * @param options
     */
    startSelection: function (options) {

        tools.getActiveTabs().then(function (tabs) {
            tools.getCurrentTab().then(function (popupTab) {

                let tabApp = tabs[0];

                tools.setStorage('selection', {
                    popupTabId: popupTab.id,
                    options: options || {},
                })

                chrome.scripting.executeScript({
                    target: { tabId:tabApp.id },
                    func: function () {
                        appSelector.deinit();
                        appSelector.init();
                    }
                });
            });
        });
    },


    /**
     *
     */
    stopSelection: function () {

        tools.getCurrentTab().then(function (tab) {

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: function () {
                    appSelector.deinit();
                }
            });
        });
    },


    /**
     * Открытие страницы с настройками
     */
    openOptions: function () {

        chrome.tabs.create({ url: "options.html" }, function (){})
    },


    /**
     * Открытие расширения в окне
     */
    openWindow: function () {

        chrome.windows.getCurrent(function(win) {

            let width  = 600;
            let height = 700;
            let left   = ((screen.width / 2) - (width / 2)) + win.left;
            let top    = ((screen.height / 2) - (height / 2)) + win.top;

            chrome.windows.create({
                url: chrome.runtime.getURL("popup.html"),
                type: "popup",
                focused: true,
                setSelfAsOpener: true,
                width: width,
                height: height,
                top: Math.round(top),
                left: Math.round(left)
            });

            window.close();
        });
    }
}


$(document).ready(function () {
    popup.init();
});
