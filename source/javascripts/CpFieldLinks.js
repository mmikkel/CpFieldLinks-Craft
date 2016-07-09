(function (window) {

    if (!window.Craft || !window.jQuery) {
        return false;
    }

    Craft.CpFieldLinksPlugin = {
        elementEditors: {},
        settings: {
            settingsClassSelector: 'cpFieldLinks-settings',
            infoClassSelector: 'cpFieldLinks-info',
            redirectKey: '_CpFieldLinksRedirectTo',
            actionInputKeys: [
                '[value="fields/saveField"]',
                '[value="sections/saveEntryType"]',
                '[value="globals/saveSet"]',
                '[value="categories/saveGroup"]',
                '[value="commerce/productTypes/saveProductType"]'
            ],
            sourceIdKeys: [
                '[name="entryTypeId"]',
                '[name="sectionId"]',
                '[name="setId"]',
                '[name="groupId"]',
                '[name="typeId"]'
            ]
        },
        init: function (data) {
            
            this.data = data;
            this.setPathAndRedirect();

            // Initialize Live Preview support
            var now = new Date().getTime(),
                livePreviewPoller = (function getLivePreview() {    
                    if (Craft.livePreview) {
                        Craft.livePreview.on('enter', this.onLivePreviewEnter.bind(this));
                        Craft.livePreview.on('exit', this.onLivePreviewExit.bind(this));
                    } else if (new Date().getTime() - now < 2000) {
                        Garnish.requestAnimationFrame(livePreviewPoller);
                    }
                }).bind(this);

            livePreviewPoller();

            // Add event handlers
            Garnish.$doc
                .on('click', '.' + this.settings.settingsClassSelector + ' a', this.onCpFieldLinksClick.bind(this))
                .on('click', '.matrix .btn.add, .matrix .btn[data-type]', this.onMatrixBlockAddButtonClick.bind(this))
                .ajaxComplete(this.onAjaxComplete.bind(this));

            this.render();
        },
        initElementEditor: function () {
            var now = new Date().getTime(),
                doInitElementEditor = (function () {
                    var timestamp = new Date().getTime(),
                        $elementEditor = $('.elementeditor:last'),
                        $hud = $elementEditor.length > 0 ? $elementEditor.closest('.hud') : false,
                        elementEditor = $hud && $hud.length > 0 ? $hud.data('elementEditor') : false;
                    if (elementEditor && elementEditor.hud) {
                        this.elementEditors[elementEditor._namespace] = elementEditor;
                        elementEditor.hud.on('hide', $.proxy(this.destroyElementEditor, this, elementEditor));
                        Garnish.requestAnimationFrame(this.addFieldLinks.bind(this));
                    } else if (timestamp - now < 2000) { // Poll for 2 secs
                        Garnish.requestAnimationFrame(doInitElementEditor);
                    }
                }).bind(this);
            doInitElementEditor();
        },
        destroyElementEditor: function (elementEditor) {
            if (this.elementEditors.hasOwnProperty(elementEditor._namespace)) {
                delete this.elementEditors[elementEditor._namespace];
            }
        },
        setPathAndRedirect: function () {
            this.path = Craft.path;
            var redirectTo = Craft.getLocalStorage(this.settings.redirectKey);
            if (redirectTo)
            {
                var $actionInput = $('input[type="hidden"][name="action"]').filter(this.settings.actionInputKeys.join(',')),
                    $redirectInput = $('input[type="hidden"][name="redirect"]');
                if ($actionInput.length > 0 && $redirectInput.length > 0)
                {
                    $redirectInput.attr('value', redirectTo);
                }
            }
            Craft.setLocalStorage(this.settings.redirectKey, null);
        },
        render: function () {
            $('.cpFieldLinks').remove();
            $('[data-cpfieldlinks]').removeAttr('data-cpfieldlinks');
            this.addSourceLink();
            this.addFieldLinks();
        },
        addSourceLink: function () {

            var $elementSourceIdInputs = $('input[type="hidden"]').filter(this.settings.sourceIdKeys.join(',')),
                elementSources = {},
                elementSourceEditLink = false,
                elementSourceEditType;

            $elementSourceIdInputs.each(function () {
                elementSources[$(this).attr('name')] = $(this).attr('value');
            });

            if (this.data.baseEditEntryTypeUrl && elementSources.hasOwnProperty('sectionId'))
            {
                elementSourceEditLink = this.data.baseEditEntryTypeUrl.replace('sectionId', elementSources.sectionId);
                elementSourceEditType = Craft.t('Entry Type');
                var typeId = $('#entryType').val() || false;
                elementSourceEditLink += '/' + (typeId ? typeId : (this.data.entryTypeIds.hasOwnProperty(elementSources.sectionId) ? this.data.entryTypeIds[elementSources.sectionId][0] : ''));
            } else if (this.data.baseEditGlobalSetUrl && elementSources.hasOwnProperty('setId') && $('input[type="hidden"][name="action"][value="globals/saveSet"]').length === 0)
            {
                elementSourceEditLink = this.data.baseEditGlobalSetUrl + '/' + elementSources.setId;
                elementSourceEditType = Craft.t('Global Set');
            } else if (this.data.baseEditCategoryGroupUrl && elementSources.hasOwnProperty('groupId') && $('input[type="hidden"][name="action"][value="categories/saveCategory"]').length)
            {
                elementSourceEditLink = this.data.baseEditCategoryGroupUrl + '/' + elementSources.groupId;
                elementSourceEditType = Craft.t('Category Group');
            } else if (this.data.baseEditCommerceProductTypeUrl && elementSources.hasOwnProperty('typeId') && $('input[type="hidden"][name="action"][value="commerce/products/saveProduct"]').length) {
                elementSourceEditLink = this.data.baseEditCommerceProductTypeUrl + '/' + elementSources.typeId;
                elementSourceEditType = Craft.t('Product Type');
            }

            if (elementSourceEditLink)
            {
                var $editSourceButton = $(this.templates.editSourceBtn(elementSourceEditLink, elementSourceEditType));
                switch (elementSourceEditType)
                {
                    case Craft.t('Global Set') :
                        $editSourceButton.appendTo($('#content'));
                        break;

                    case Craft.t('Entry Type') : case Craft.t('Category Group') :
                        $('#settings').find('.field:last').append($editSourceButton);
                        break;

                    case Craft.t('Product Type') :
                        $('#meta-pane').find('.field:last').append($editSourceButton);
                        break;

                    default :
                        $editSourceButton.appendTo($('#main'));
                }
            }

        },
        addFieldLinks: function () {

            var self = this,
                targets = [$(this.getFieldContextSelector())],
                $target;

            if (this.elementEditors && Object.keys(this.elementEditors).length) {
                for (var key in this.elementEditors) {
                    targets.push(this.elementEditors[key].$form);
                }
            }

            for (var i = 0; i < targets.length; ++i) {
                
                $target = targets[i];

                if (!$target || !$target.length) {
                    continue;
                }

                // Add CpFieldLinks to regular fields
                var fieldData = this.data.fields || {},
                    $fields = $target.find('.field:not([data-cpfieldlinks])').not('.matrixblock .field'),
                    $field,
                    fieldHandle;
                $fields.each(function () {
                    $field = $(this);
                    fieldHandle = self.getFieldHandleFromAttribute($field.attr('id'));
                    if (fieldHandle && fieldData.hasOwnProperty(fieldHandle)) {
                        $field.find('.heading:first label').after(self.templates.editFieldBtn(fieldData[fieldHandle]));
                    }
                    $field.attr('data-cpfieldlinks', true);
                });

                // Add CpFieldLinks to Commerce variant fields
                $target.find('.variant-matrixblock:not([data-cpfieldlinks])').each(function () {
                    $(this).attr('data-cpfieldlinks', true).find('.field').each(function () {
                        $field = $(this);
                        fieldHandle = self.getFieldHandleFromAttribute($field.attr('id'));
                        if (fieldHandle && fieldData.hasOwnProperty(fieldHandle)) {
                            $field.find('.heading:first label').after(self.templates.editFieldBtn(fieldData[fieldHandle]));
                        }
                    });
                });         

                // Add CpFieldLinks to Matrix blocks
                var $matrixBlocks = $target.find('.matrixblock:not([data-cpfieldlinks])'),
                    $block,
                    blockId,
                    blockFieldData;
                $matrixBlocks.each(function () {
                    $block = $(this);
                    fieldHandle = self.getFieldHandleFromAttribute($block.closest('.field').attr('id'));
                    if (!fieldHandle || !fieldData.hasOwnProperty(fieldHandle)) return;
                    blockId = $block.data('id');
                    $block.attr('data-cpfieldlinks', true).find('.field').each(function () {
                        $field = $(this);
                        blockFieldData = {
                            id: fieldData[fieldHandle].id,
                            handle: self.getFieldHandleFromAttribute($field.attr('id'))
                        }
                        $field.find('.heading:first label').after(self.templates.editFieldBtn(blockFieldData));
                    });
                });

            }

        },
        getFieldHandleFromAttribute: function (value) {
            if (!value) return false;
            value = value.split('-');
            if (value.length < 3) return false;
            return value[value.length-2];
        },
        getFieldContextSelector: function () {
            if (this.isLivePreview) {
                return '.lp-editor';
            }
            return '#main';
        },
        templates: {
            editFieldBtn: function (attributes)
            {
                return  '<div class="cpFieldLinks cpFieldLinks-fieldEdit" aria-hidden="true">' +
                            '<div class="' + Craft.CpFieldLinksPlugin.settings.settingsClassSelector + '">' +
                                '<a href="' + Craft.CpFieldLinksPlugin.data.baseEditFieldUrl + '/' + attributes.id + '" class="settings icon" role="button" aria-label="Edit field" tabindex="-1"></a>' +
                            '</div>' +
                            '<div class="' + Craft.CpFieldLinksPlugin.settings.infoClassSelector + '">' + '<p><code>' + attributes.handle + '</code></p></div>' +
                        '</div>';
            },
            editSourceBtn: function (href, type)
            {
                return  '<div class="cpFieldLinks cpFieldLinks-sourceEdit">' +
                            '<div class="cpFieldLinks-wrapper">' +
                                '<div class="' + Craft.CpFieldLinksPlugin.settings.settingsClassSelector + '">' +
                                    '<a href="' + href + '" class="settings icon" role="button" aria-label="Edit ' + (type || 'element source') + '"></a>' +
                                '</div>' +
                                '<div class="' + Craft.CpFieldLinksPlugin.settings.infoClassSelector + '">' + '<p><span>Edit ' + (type || 'element source') + '</span></p></div>' +
                            '</div>' +
                        '</div>';
            }
        },
        onLivePreviewEnter: function () {
            this.isLivePreview = true;
            Garnish.requestAnimationFrame((function () {
                this.addFieldLinks();
            }).bind(this));
        },
        onLivePreviewExit: function () {
            this.isLivePreview = false;
            Garnish.requestAnimationFrame((function () {
                this.addFieldLinks();
            }).bind(this));
        },
        onCpFieldLinksClick: function (e) {
            Craft.setLocalStorage(this.settings.redirectKey, Craft.path);
        },
        onMatrixBlockAddButtonClick: function (e) {
            Garnish.requestAnimationFrame((function () {
                this.addFieldLinks();
            }).bind(this));
        },
        onAjaxComplete: function(e, status, requestData) {
            if (requestData.url.indexOf('switchEntryType') > -1 || Craft.path !== this.path) {
                this.render();
            }
        }
    };

} (window));