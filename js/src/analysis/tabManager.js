/* global YoastSEO */

var defaultsDeep = require( "lodash/defaultsDeep" );

var KeywordTab = require( "./keywordTab" );
var GenericTab = require( "./genericTab" );

var $ = jQuery;

var defaultArguments = {
	strings: {
		keywordTab: "",
		contentTab: "",
	},
	focusKeywordField: "#yoast_wpseo_focuskw",
	contentAnalysisActive: "1",
};

/**
 * The tab manager is responsible for managing the analysis tabs in the metabox.
 *
 * @constructor
 */
function TabManager( args ) {
	args = args || {};

	defaultsDeep( args, defaultArguments );

	this.arguments = args;
	this.strings = args.strings;
}

/**
 * Initializes the two tabs.
 */
TabManager.prototype.init = function() {
	var metaboxTabs = $( "#wpseo-metabox-tabs" );

	// Remove default functionality to prevent scrolling to top.
	metaboxTabs.on( "click", ".wpseo_tablink", function( ev ) {
		ev.preventDefault();
	} );

	this.focusKeywordInput = $( "#yoast_wpseo_focuskw_text_input,#wpseo_focuskw" );
	this.focusKeywordRow = this.focusKeywordInput.closest( "tr" );
	this.contentAnalysis = $( "#yoast-seo-content-analysis" );
	this.keywordAnalysis = $( "#wpseo-pageanalysis, #wpseo_analysis" );
	this.snippetPreview  = $( "#wpseosnippet" ).closest( "tr" );

	var initialKeyword   = $( this.arguments.focusKeywordField ).val();

	// We start on the content analysis 'tab'.
	this.contentAnalysis.show();
	this.keywordAnalysis.hide();
	this.focusKeywordRow.hide();

	// Initialize an instance of the keyword tab.
	this.mainKeywordTab = new KeywordTab( {
		keyword: initialKeyword,
		prefix: this.strings.keywordTab,
		fallback: this.strings.enterFocusKeyword,
		onActivate: function() {
			this.showKeywordAnalysis();
			this.contentTab.deactivate();
		}.bind( this ),
		afterActivate: function() {
			YoastSEO.app.refresh();
		},
	} );

	this.contentTab = new GenericTab( {
		label: this.strings.contentTab,
		onActivate: function() {
			this.showContentAnalysis();
			this.mainKeywordTab.deactivate();
		}.bind( this ),
		afterActivate: function() {
			YoastSEO.app.refresh();
		},
	} );

	if ( this.arguments.keywordAnalysisActive ) {
		this.mainKeywordTab.init( metaboxTabs );
	}

	if ( this.arguments.contentAnalysisActive ) {
		this.contentTab.init( metaboxTabs );
	}

	$( ".yoast-seo__remove-tab" ).remove();
};

/**
 * Shows the keyword analysis elements.
 */
TabManager.prototype.showKeywordAnalysis = function() {
	this.focusKeywordRow.show();
	this.keywordAnalysis.show();
	this.contentAnalysis.hide();

	if ( this.arguments.keywordAnalysisActive ) {
		this.snippetPreview.show();
	}
};

/**
 * Shows the content analysis elements.
 */
TabManager.prototype.showContentAnalysis = function() {
	this.focusKeywordRow.hide();
	this.keywordAnalysis.hide();
	this.contentAnalysis.show();

	if ( this.arguments.keywordAnalysisActive ) {
		this.snippetPreview.hide();
	}
};

/**
 * Updates the content tab with the calculated score
 *
 * @param {number} score The score that has been calculated.
 */
TabManager.prototype.updateContentTab = function( score ) {
	this.contentTab.updateScore( score );
};

/**
 * Updates the keyword tab with the calculated score
 *
 * @param {number} score The score that has been calculated.
 * @param {string} keyword The keyword that has been used to calculate the score.
 */
TabManager.prototype.updateKeywordTab = function( score, keyword ) {
	this.mainKeywordTab.updateScore( score, keyword );
};

/**
 * Returns whether or not the keyword is the main keyword
 *
 * @param {string} keyword The keyword to check
 *
 * @returns {boolean}
 */
TabManager.prototype.isMainKeyword = function( keyword ) {
	return this.mainKeywordTab.getKeywordFromElement() === keyword;
};

/**
 * Returns the keyword tab object
 *
 * @returns {KeywordTab} The keyword tab object.
 */
TabManager.prototype.getKeywordTab = function() {
	return this.mainKeywordTab;
};

/**
 * Returns the content tab object
 *
 * @returns {KeywordTab} The content tab object.
 */
TabManager.prototype.getContentTab = function() {
	return this.contentTab;
};

module.exports = TabManager;
