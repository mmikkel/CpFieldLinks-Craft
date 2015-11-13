<?php namespace Craft;

class CpFieldLinksPlugin extends BasePlugin
{

    protected   $_version = '1.0',
                $_pluginName = 'CP Field Links',
                $_pluginUrl = 'https://github.com/mmikkel/CpFieldLinks-Craft',
                $_developer = 'Mats Mikkel Rummelhoff',
                $_developerUrl = 'http://mmikkel.no';

    public function getName()
    {
        return $this->_pluginName;
    }

    public function getVersion()
    {
        return $this->_version;
    }

    public function getDeveloper()
    {
        return $this->_developer;
    }

    public function getDeveloperUrl()
    {
        return $this->_developerUrl;
    }

    public function getPluginUrl()
    {
        return $this->_pluginUrl;
    }

    public function init()
    {
        parent::init();

        $request = craft()->request;

        if (!$request->isCpRequest() || $request->isAjaxRequest() || !craft()->config->get('devMode')) return false;

        $this->addResources();

    }

    protected function addResources()
    {

        // Get revision manifest
        $manifestPath = dirname(__FILE__) . '/resources/rev-manifest.json';
        $manifest = (file_exists($manifestPath) && $manifest = file_get_contents($manifestPath)) ? json_decode($manifest) : false;

        // Get data
        $data = [
            'fields' => [],
            'entryTypeIds' => [],
            'baseEditFieldUrl' => rtrim(UrlHelper::getCpUrl('settings/fields/edit'), '/'),
            'baseEditEntryTypeUrl' => rtrim(UrlHelper::getCpUrl('settings/sections/sectionId/entrytypes'), '/'),
            'baseEditGlobalSetUrl' => rtrim(UrlHelper::getCpUrl('settings/globals'), '/'),
            'baseEditCategoryGroupUrl' => rtrim(UrlHelper::getCpUrl('settings/categories'), '/'),
        ];

        $sectionIds = craft()->sections->allSectionIds;
        foreach ($sectionIds as $sectionId)
        {
            $entryTypes = craft()->sections->getEntryTypesBySectionId($sectionId);
            $data['entryTypeIds']['' . $sectionId] = [];
            foreach ($entryTypes as $entryType)
            {
                $data['entryTypeIds']['' . $sectionId][] = $entryType->id;
            }
        }

        $fields = craft()->fields->allFields;

        foreach ($fields as $field)
        {
            $data['fields'][$field->handle] = [
                'id' => $field->id,
                'handle' => $field->handle,
                'type' => $field->type,
            ];
        }

        $data = json_encode($data);
        craft()->templates->includeJs('window._CpFieldLinksData='.$data.';');

        // Include resources
        $cssFile = 'stylesheets/CpFieldLinks.css';
        $jsFile = 'javascripts/CpFieldLinks.js';

        craft()->templates->includeCssResource('cpfieldlinks/' . ($manifest ? $manifest->$cssFile : $cssFile));
        craft()->templates->includeJsResource('cpfieldlinks/' . ($manifest ? $manifest->$jsFile : $jsFile));



    }

}
