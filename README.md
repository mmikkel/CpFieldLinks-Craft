# CP Field Links v. 1.2.1 for Craft CMS ![Craft 2.5](https://img.shields.io/badge/craft-2.5-red.svg?style=flat-square)

CP Field Links is a tiny utility plugin making content modelling a little bit easier in Craft.  

Did you forget a field handle? Mouse over the cogwheel next to the field title, and CP Field Links will tell you.  

Need to adjust some field settings? Click the cogwheel; CP Field Links will redirect you to the relevant field's settings page – and back to the content when you're done.  

Additionally, CP Field Links will add a link in your element edit forms to manage source settings (e.g. entry type, category group) in the same manner.  

Note that CP Field Links will only be active for **admin** users.  

**Recent updates**  
* Now working inside Live Preview, Matrix and Element Editor modals
* Full Craft Commerce support (including variants)

![Easily inspect field handles and edit fields](http://g.recordit.co/i8SOUKWYpq.gif)

## Installation

1. Download, unzip and put the `cpfieldlinks` folder in `craft/plugins`
2. Install from CP

## Disclaimer

This plugin is totally free, and you can do whatever you want with it (and to it). CP Field Links is unlikely to mess up your stuff, but if it does, the author takes absolutely no responsibility.  
Please direct any bug reports or feature requests [here](https://github.com/mmikkel/CpFieldLinks-Craft/issues).

## Changelog

### 1.2.1 (09.16.16)
* [Fixed] Fixes issue with PHP 5.3

### 1.2 (07.09.16)
* [Added] Matrix support
* [Added] Element Editor modals support
* [Added] Full support for Craft Commerce (including variants)
* [Added] Added 'Edit Product Type' link to Commerce Products
* [Improved] Plugin now works as intended in Live Preview
* [Improved] Field cogwheels are no longer tabbable
* [Improved] Fixed position for 'Edit Entry Type' cogwheel

### 1.1 (05.23.16)
* [Added] CP Field Links is now active/visible for all logged in admin users, regardless of devMode status
* [Fixed] Defined schema version

### 1.0.1 (01.12.16)
* [Added] Added release feed, documentation URL and description
* [Improved] Moved Edit source button to a better position

### 1.0 (11.12.15)
* Initial public release
