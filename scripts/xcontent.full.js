// Used for templating
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match; 
    });
};

function rebind__tip() {
    $.getScript("https://static-waterdeep.cursecdn.com/1-0-6583-30578/js/Waterdeep/Waterdeep.Tip.js", function() {});
}

// Chrome Extension Event Listener
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    /*console.log(msg, sender, { recieved: true });*/
    if (msg.action == 'tb-monster-loaded') {
        parseMonster();
    }else if (msg.action == 'tb-rebuild') {
        tbBuild();
    }else if (msg.action == 'tb-scan-page') {
        scanPage();
    }
    return true;
});

function tbBuild() {
    // GET SAVED NOTES
    chrome.storage.sync.get("notes", function(items) {
        if (typeof items.notes !== 'undefined') {
            $('.tb-toolbox #tbGroupNotes .tb-manager-content textarea').val(items.notes);
        }
    });

    // GET SAVED INITIATIVE
    chrome.storage.sync.get("initiative", function(items) {
        if (typeof items.initiative !== 'undefined') {
            __INITIATIVE = items.initiative;

            $('#tbGroupInitiativeTracker .tb-manager-content > ul.quick-menu li').remove();
            $.each(__INITIATIVE, function(index, player) {
                buildInitiative(player)
            });
        }
    });

    // GET SAVED PLAYERS
    chrome.storage.sync.get("players", function(items) {
        if (typeof items.players !== 'undefined') {
           __CUSTOMPLAYERS = items.players;
            buildCustomPlayers(items.players);
        }
    });

    // GET SAVED ENCOUNTERS
    chrome.storage.sync.get("encounters", function(items) {
        if (typeof items.encounters !== 'undefined') {
            __ENCOUNTERS = items.encounters;
            buildEncounters();
        }
    });

    // GET TOOLBOX SETTINGS
    chrome.storage.sync.get("toolbox", function(items) {
        if (typeof items.toolbox !== 'undefined') {
            $('.tb-toolbox .tb-manager-group').removeClass('tb-manager-group-opened').addClass('tb-manager-group-collapsed');
            $('body').removeClass('tb-shown');

            if (items.toolbox.toolbox) {
                $('body').addClass('tb-shown');
            }

            if (items.toolbox.notes) {
                $('#tbGroupNotes').removeClass('tb-manager-group-collapsed').addClass('tb-manager-group-opened');
            }

            if (items.toolbox.initiative) {
                $('#tbGroupInitiativeTracker').removeClass('tb-manager-group-collapsed').addClass('tb-manager-group-opened');
            }

            if (items.toolbox.players) {
                $('#tbGroupPlayers').removeClass('tb-manager-group-collapsed').addClass('tb-manager-group-opened');
            }

            if (items.toolbox.encounters) {
                $('#tbGroupEncounters').removeClass('tb-manager-group-collapsed').addClass('tb-manager-group-opened');
            }
        }
    });
}

function tbSave(key, data) {
    var obj = {};
    obj[key] = data;
    chrome.storage.sync.set(obj, function() {
        /*console.log(chrome.runtime.lastError);
        chrome.storage.sync.get(key, function(items) {
            console.log(items)
        })
        console.log(obj);*/
    });
}

/*chrome.storage.sync.clear(function() {
    console.log('Storage Cleared');
});*/
var __ENCOUNTERS = {};
var __CUSTOMPLAYERS = [];
var __INITIATIVE = [];
var __TOOLBOX = {
    toolbox: false,
    notes: false,
    initiative: false,
    players: false,
    encounters: false
}

var toolboxTemplate = ['<div class="subsection-group tb-toolbox">',
        '<div class="subsection-group-inner">',
            '<div class="subsection-group-header">',
                '<div class="subsection-group-heading">D&amp;D Toolbox</div>',
            '</div>',
            '<div class="subsection-group-body">',
                '<div class="subsection-group-body-inner"></div>',
            '</div>',
        '</div>',
        '<div id="tbTooltip"></div>',
    '</div>'].join('\n');

var modalTemplate = ['<div class="tb-modal fullscreen-modal-overlay">',
        '<div class="fullscreen-modal" tabindex="-1">',
            '<div class="fullscreen-modal-header">',
                '<div class="fullscreen-modal-heading">{1}</div>',
                '<div class="fullscreen-modal-close"><span class="fullscreen-modal-close-btn tb-modal-close"></span></div>',
            '</div>',
            '<div class="fullscreen-modal-content">{0}</div>',
            '<div class="fullscreen-modal-footer">',
                '<div class="fullscreen-modal-accept fullscreen-modal-action">',
                    '<button class="character-button character-button-modal">{2}</button>',
                '</div>',
                '<div class="fullscreen-modal-cancel fullscreen-modal-action">',
                    '<button class="character-button character-button-modal-cancel tb-modal-close">Cancel</button>',
                '</div>',
            '</div>',
        '</div>',
    '</div>'].join('\n');

var templates = {
        manager: ['<div id="{0}" class="tb-manager-group tb-manager-group-collapsed">',
            '<div class="tb-manager-header">',
                '<div class="tb-manager-heading">{1}</div>',
                '<div class="tb-manager-trigger"></div>',
            '</div>',
            '<div class="tb-manager-content"></div>',
        '</div>'].join('\n'),
        collapsible: ['<div class="collapsible collapsible-collapsed">',
            '<div class="collapsible-header">',
                '<div class="collapsible-header-content">',
                    '<div class="collapsible-header-el">',
                        '<div class="collapsible-header-info">',
                            '<div class="collapsible-heading">{0}</div>',
                            '<div class="collapsible-header-meta"><span class="collapsible-header-meta-item">{1}</span></div>',
                        '</div>',
                        '<div class="collapsible-heading-callout">',
                            '<div class="limited-list-item-callout">',
                                '<button class="character-button character-button-outline">{2}</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="collapsible-header-trigger"></div>',
            '</div>',
            '<div class="collapsible-body"></div>',
        '</div>'].join('\n'),
        monster: ['<li class="quick-menu-item">',
            '<div class="quick-menu-item-label">',
                '<div class="remove">&times;</div>',
                '<div class="quick-menu-item-link" data-href="{0}" data-xp="{3}" data-ac="{2}"><span>{1}</span>',
                    '<div class="quick-menu-item-meta">AC: {2} | XP: {3}</div>',
                    '<a class="monster-page" href="{0}">&nbsp;</a>',
                    '<div class="tb-form-field tb-monster-health">',
                        '<input type="number" name="encounter-monster-max-health" class="tb-control" value="{5}" min="0" data-max="{4}" autocomplete="off" placeholder="Health">',
                    '</div>',
                '</div>',
            '</div>',
        '</li>'].join('\n'),
        managerRemove: ['<div class="tb-manager-item-actions">',
            '<div class="tb-manager-item-remove">',
                '<span class="equipment-list-item-remove-icon"></span>{0}',
            '</div>',
        '</div>'].join('\n'),
        calloutButton: ['<div class="limited-list-item-callout">',
            '<button class="character-button character-button-outline">{0}</button>',
        '</div>'].join('\n'),
        quickMenuItem: ['<li class="quick-menu-item quick-menu-item-players quick-menu-item-closed">',
            '<div class="quick-menu-item-label">',
                '<div class="remove">&times;</div>',
                '<p class="quick-menu-item-link" data-href="{0}">{1}<span>{2}</span></p>',
                '<div class="limited-list-item-callout">',
                    '<a class="character-button character-button-outline">{3}</a>',
                '</div>',
            '</div>',
        '</li>'].join('\n')
    };

/* TOGGLE TOOLBOX
=================================*/
function toolboxMenus() {
    __TOOLBOX = {
        toolbox: $('body').hasClass('tb-shown'),
        notes: $('#tbGroupNotes').hasClass('tb-manager-group-opened'),
        initiative: $('#tbGroupInitiativeTracker').hasClass('tb-manager-group-opened'),
        players: $('#tbGroupPlayers').hasClass('tb-manager-group-opened'),
        encounters: $('#tbGroupEncounters').hasClass('tb-manager-group-opened')
    }
    tbSave('toolbox', __TOOLBOX);
}

$('body header > nav.main > ul').append('<li id="nav-toolbox" class="b-list-item p-nav-item"><a href="#toolbox" class=""><span class="b-list-label">Toolbox</span></a></li>');
$('body .user-interactions > .user-interactions-quick').append('<a class="user-interactions-quick-link user-interactions-quick-notifications j-netbar-link" href="#toolbox"><i class="fa fa-wrench"></i></a>');

$('body').on('click', 'a[href="#toolbox"]', function(evt) {
    evt.preventDefault();
    $('body').toggleClass('tb-shown');
    toolboxMenus();
});

/* MODAL POPUP
=================================*/
$('body').on('click', '.tb-modal .tb-modal-close', function() {
    $('body').removeClass('modal-shown').find('.tb-modal').remove();
});
$('body').on('click', '.tb-modal .tb-input-group .tb-control', function() {
    $(this).closest('.tb-input-group').find('label').addClass('active');
});
$('body').on('blur', '.tb-modal .tb-input-group .tb-control', function() {
    $(this).closest('.tb-input-group').find('label').removeClass('active');

    if ($(this).val().length >= 1) {
        $(this).closest('.tb-input-group').find('label').addClass('active');
    }
});

/* TOOLBOX
=================================*/
$('body').append(toolboxTemplate);
//$('.tb-toolbox .subsection-group-body-inner').append(templates.manager.format('tbGroupDiceRoller', 'Dice Roller'));
$('.tb-toolbox .subsection-group-body-inner').append(templates.manager.format('tbGroupNotes', 'Notes'));
$('.tb-toolbox .subsection-group-body-inner').append(templates.manager.format('tbGroupInitiativeTracker', 'Initiative Tracker'));
$('.tb-toolbox .subsection-group-body-inner').append(templates.manager.format('tbGroupPlayers', 'Players'));
$('.tb-toolbox .subsection-group-body-inner').append(templates.manager.format('tbGroupEncounters', 'Encounters'));

$('#tbGroupInitiativeTracker .tb-manager-content').append('<ul class="quick-menu quick-menu-tier-2"></ul>');
$('#tbGroupEncounters .tb-manager-header .tb-manager-heading').after(templates.calloutButton.format('Custom Monster'));


$('body').on('click', '.tb-manager-group > .tb-manager-header', function(evt) {
    evt.preventDefault();
    if (!$(evt.target).hasClass('character-button')) {
        $(this).closest('.tb-manager-group').toggleClass('tb-manager-group-collapsed tb-manager-group-opened');
        toolboxMenus();
    }
})
$('body').on('click', '.collapsible .collapsible-header', function(evt) {
    evt.preventDefault();
    if (!$(evt.target).hasClass('character-button')) {
        $(this).closest('.collapsible').toggleClass('collapsible-collapsed collapsible-opened');
    }
});
$('body').on('click', '.quick-menu .quick-menu-item .quick-menu-item-trigger', function(evt) {
    evt.preventDefault();
    $(this).closest('li').toggleClass('quick-menu-item-closed quick-menu-item-opened');
});

/* DICE ROLLER
=================================*/
function scanPage() {
    var inputstring = "/([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?/i";
    var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
    var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
    var regex = new RegExp(pattern, flags);

    $('body').unmark({
        done: function() {
            $('body').markRegExp(regex, {
                element: 'span',
                className: 'tb-roller',
                exclude: [
                    'a.view-rules *',
                    'div.subsection-group-popup *'
                ],
                each: function(item) {
                    var $item = $(item);
                    $item.attr('title', 'Roll {0}'.format($item.text()));
                }
            });
        }
    });
}
function diceRoller(strDie, title) {
    var diceRolls = droll.roll(strDie.replace('−', '-')),
        rolls = "";

    if (diceRolls !== false) {
        for (iRoll = 0; iRoll < diceRolls.rolls.length; iRoll++) {
            rolls += "+ {0} ".format(diceRolls.rolls[iRoll]);
        }
        rolls = rolls.substring(2);
        if (diceRolls.modifier != 0) {
            rolls += ")";
            rolls += " + {0}".format(diceRolls.modifier);
            rolls = "( " + rolls;
        }
        rolls += " = {0}".format(diceRolls.total);

        var content = '<h6>Rolling {0}</h6><p>{1}</p><h5>Total: {2}</h5>'.format(strDie, rolls, diceRolls.total);

        $('body').addClass('modal-shown')
        $('.tb-toolbox').append($(modalTemplate.format(content, title, 'Reroll')));
        $('.tb-toolbox').find('.tb-modal').addClass('tb-modal-small');

        $('.fullscreen-modal-accept').on('click', function(evt) {
            $('body').find('.tb-modal').remove();
            diceRoller(strDie, title)
        });
    }
}
$('body').on('click', '.tb-roller', function() {
    var roll = $(this).text().replace(/ /g,''),
        title = 'Dice Roller';

    diceRoller(roll, title);
});

/* NOTES
=================================*/
$('.tb-toolbox #tbGroupNotes .tb-manager-content').append('<div class="tb-form-field"><textarea class="tb-control"></textarea></div>');
$('.tb-toolbox #tbGroupNotes .tb-manager-content').append('<div class="tb-manager-item-actions"><button class="character-button-oversized">Save</button></div>');
$('body').on('click', '.tb-toolbox #tbGroupNotes .tb-manager-content button.character-button-oversized', function(evt) {
    evt.preventDefault();
    var $note = $(this).closest('.tb-manager-content').find('textarea');
    tbSave('notes', $note.val());
});


/* PLAYERS
=================================*/
function buildCampaignSelection() {
    var $container = $('.tb-toolbox #tbGroupPlayers .tb-manager-content');
    var $campaigns = $(templates.collapsible.format('Campaigns', '', ''));

    $campaigns.find('.limited-list-item-callout').remove();
    $campaigns.find('.collapsible-body').append('<div class="tb-form-field"><select class="character-select"><option value="none">- Choose a Campaign -</option></select></div><ul class="quick-menu quick-menu-tier-2"></ul>');


    $container.append($campaigns);

    var $initiativeTracker = $('<div/>');
    $initiativeTracker.load('/my-content/campaigns div.RPGCampaign-listing', function() {
        $initiativeTracker.find('li').each(function(index, item) {
            var $item = $(item);

            var details = {
                name: $.trim($item.find('.ddb-campaigns-list-item-body-title').text()),
                players: $.trim($item.find('.player-count .count').text()),
                campaign: $.trim($item.find('.ddb-campaigns-list-item-footer-buttons > a:first-child').attr('href'))
            }

            $('.tb-toolbox #tbGroupPlayers .tb-manager-content select.character-select').append('<option value="{2}">{0} | {1} players</option>'.format(details.name, details.players, details.campaign));
        });
    });

    $campaigns.find('.collapsible-body select.character-select').on('change', function() {
        var $list = $(this).closest('.collapsible-body').find('ul.quick-menu'),
            $selected = $(this).find(":selected"),
            $players = $('<div/>');

        $(this).closest('.collapsible-body').find('ul.quick-menu').html('');

        if ($selected.val() != 'none') {
            $players.load($selected.val() + ' div.ddb-campaigns-detail-body-listing-active>div.RPGCampaignCharacter-listing', function() {
                __PLAYERS = [];
                $players.find('li').each(function(index, item) {
                    var $item = $(item),
                        player = {
                            url: $item.find('.ddb-campaigns-character-card-footer-links-item-view').attr('href'),
                            name: $item.find('.ddb-campaigns-character-card-header-upper-character-info-primary').text(), 
                            player: $item.find('.ddb-campaigns-character-card-header-upper-character-info-secondary').eq(1).text(),
                            info: $item.find('.ddb-campaigns-character-card-header-upper-character-info-secondary').eq(0).text()
                        };

                    $list.append(templates.quickMenuItem.format(player.url, player.name, player.player, 'Add'));
                });
            });
        }
    });
}
function buildCustomPlayersContainer() {
    var $container = $('.tb-toolbox #tbGroupPlayers .tb-manager-content');
    var $players = $(templates.collapsible.format('Players', '', ''));

    $players.find('.limited-list-item-callout').remove();
    $players.find('.collapsible-body').append('<ul class="quick-menu quick-menu-tier-2"></ul><div class="tb-manager-item-actions"><button class="character-button-oversized">New Player</button></div>');
    $players.attr('id', 'tbGroupPlayersCustom');

    $container.append($players);
}
function buildCustomPlayers(players) {
    $('#tbGroupPlayersCustom ul.quick-menu li').remove();
    $.each(players, function(index, player) {
        $('#tbGroupPlayersCustom ul.quick-menu').append(templates.quickMenuItem.format(player.url, player.name, player.player, 'Add'));
    });
}
buildCampaignSelection();
buildCustomPlayersContainer();

$('body').on('click', '#tbGroupPlayers .quick-menu .quick-menu-item .limited-list-item-callout > a', function(evt) {
    evt.preventDefault();
    var $player = $(this).closest('li'),
        player = {
            url: $player.find('.quick-menu-item-link').attr('data-href'),
            name: $player.find('.quick-menu-item-link').contents().get(0).nodeValue, 
            player: $player.find('.quick-menu-item-link > span').text(),
            children: []
        };

    __INITIATIVE.push(player);
    buildInitiative(player);
});

$('body').on('click', '#tbGroupPlayersCustom button.character-button-oversized', function(evt) {
    evt.preventDefault();

     var content = ['<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Character Name</label>',
                '<input type="text" name="custom-player-name" class="tb-control" placeholder="Character Name">',
            '</div>',
        '</div>',
        '<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Player Name</label>',
                '<input type="text" name="custom-player-player" class="tb-control" placeholder="Player Name">',
            '</div>',
        '</div>',
        '<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Player URL</label>',
                '<input type="text" name="custom-player-url" class="tb-control" placeholder="Player URL">',
            '</div>',
        '</div>',
        '<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Player Info</label>',
                '<input type="text" name="custom-player-info" class="tb-control" placeholder="Player Info">',
            '</div>',
        '</div>'].join('\n');

    //content = content.format();
    $('body').addClass('modal-shown').append($(modalTemplate.format(content, 'Add Custom Player', 'Add')));

    $('.fullscreen-modal-accept').on('click', function(evt) {
        var $content = $('.fullscreen-modal-content'),
            player = {
                url: $content.find('input[name="custom-player-url"]').val(),
                name: $content.find('input[name="custom-player-name"]').val(), 
                player: $content.find('input[name="custom-player-player"]').val(),
                info: $content.find('input[name="custom-player-info"]').val()
            };

        __CUSTOMPLAYERS.push(player);

        $('#tbGroupPlayersCustom ul.quick-menu').append(templates.quickMenuItem.format(player.url, player.name, player.player, 'Add'));
        $('.tb-modal-close').trigger('click');

        tbSave('players', __CUSTOMPLAYERS);
    });
});
$('body').on('click', '#tbGroupPlayersCustom ul.quick-menu li.quick-menu-item .remove', function(evt) {
    evt.preventDefault();
    var index = $(this).closest('li').index();

    $(this).closest('li').remove();
    __CUSTOMPLAYERS.splice(index,1);
    tbSave('players', __CUSTOMPLAYERS);
});

/* MONSTER INFO
=================================*/
function parseMonster() {
    $(".mon-stat-block:not(.tb-processed)").each(function(index, element) {
        var $element = $(element);
        $element.addClass('tb-processed');

        // Add Audio to monster info box
        var $audio = $('<div/>'),
            monsterURL = $element.find('a.mon-stat-block__name-link').attr('href');

        // Get audio file and add next to monster name
        $audio.load(monsterURL + ' audio#pronunciation-player', function() {
            if ($audio.children().length >= 1) {
                $element.find('.mon-stat-block__name').prepend($audio.addClass('ddb-pronunciation-clip tb-audio'));
            }
        });

        $element.find('.mon-stat-block__name').append('<button class="tb-btn"><i class="tb-icon tb-swords-and-shield"></i></button>')
    });
}
parseMonster();

/* ENCOUNTER INFORMATION
=================================*/
function saveEncounter($list) {
    var encounter = $list.closest('.collapsible').find('.collapsible-heading').text(),
        monsters = [];

    $list.find('li').each(function(index, item) {
        var $content = $(item),
            monster = {
                url: $content.find('.quick-menu-item-link').data('href'),
                name: $content.find('.quick-menu-item-link span').text(),
                ac: $content.find('.quick-menu-item-link').data('ac'),
                xp: $content.find('.quick-menu-item-link').data('xp'),
                hp: { 
                    max: $content.find('input[name="encounter-monster-max-health"]').val(),
                    current: $content.find('input[name="encounter-monster-max-health"]').val()
                }
            };
        monsters.push(monster);
    });

    __ENCOUNTERS[encounter] = monsters;
    tbSave('encounters', __ENCOUNTERS); 
}

function buildEncounters() {
    var $container = $('.tb-toolbox #tbGroupEncounters .tb-manager-content');
    $container.html('');

    $.each(__ENCOUNTERS, function(encounter, monsters) {
        var $encounter = $(templates.collapsible.format(encounter, '', 'Add'));
        $encounter.find('.collapsible-body').append('<ul class="quick-menu quick-menu-tier-2"></ul>');
        $.each(monsters, function(index, monster) {
            var $monster = $(templates.monster.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.current));
            $encounter.find('.collapsible-body .quick-menu').append($monster);
        });
        $encounter.find('.collapsible-body').append(templates.managerRemove.format('Remove Encounter'));
        $container.append($encounter);
    });

    $('.tb-toolbox #tbGroupEncounters .tb-manager-content .quick-menu').sortable({
        animation: 100,
        onUpdate: function (evt) {
            saveEncounter($(evt.target));
        }
    });
}
$('body').on('keypress', '.tb-toolbox #tbGroupEncounters .tb-manager-content input[type="number"]', function(evt) {
    if (evt.which == 13) {
        $(this).blur();
    }
});
$('body').on('blur', '.tb-toolbox #tbGroupEncounters .tb-manager-content input[type="number"]', function() {
    saveEncounter($(this).closest('ul'));
});

function saveInitiative() {
    var $initiative = $('#tbGroupInitiativeTracker .tb-manager-content > ul.quick-menu > li.quick-menu-item'),
        initiative = [];

    $initiative.each(function(iplayer, player) {
        var $player = $(player),
            initiativePlayer = {
                url: $player.children('.quick-menu-item-label').find('p').attr('data-href'),
                name: $player.children('.quick-menu-item-label').find('.quick-menu-item-link').contents().get(0).nodeValue, 
                player: $player.children('.quick-menu-item-label').find('.quick-menu-item-link > span').text(),
                children: []
            };

        if ($player.find('ul.quick-menu > li.quick-menu-item').length > 0) {
            var $initiativeMonsters = $player.find('ul.quick-menu > li.quick-menu-item');

            $initiativeMonsters.each(function(imonster, monster) {
                var $monster = $(monster),
                    monster = {
                        url: $monster.find('.quick-menu-item-link').data('href'),
                        name: $monster.find('.quick-menu-item-link span').text(),
                        ac: $monster.find('.quick-menu-item-link').data('ac') * 1,
                        xp: $monster.find('.quick-menu-item-link').data('xp') * 1,
                        hp: { 
                            max: $monster.find('input[name="encounter-monster-max-health"]').attr('max') * 1,
                            current: $monster.find('input[name="encounter-monster-max-health"]').val() * 1
                        }
                    }
                initiativePlayer.children.push(monster);
            })
        } 

        initiative.push(initiativePlayer);
    });

    __INITIATIVE = initiative;
    tbSave('initiative', __INITIATIVE);
}

function buildInitiative(player) {
    var $encounter = $(templates.quickMenuItem.format(player.url, player.name, player.player, 'View'));
    $encounter.find('div.quick-menu-item-label > .limited-list-item-callout > a').attr('href', player.url);

    if (player.children.length > 0) {
        $encounter.find('div.quick-menu-item-label > .limited-list-item-callout').remove();
        $encounter.find('div.quick-menu-item-label').append('<div class="quick-menu-item-trigger"></div>');
        $encounter.append('<ul class="quick-menu quick-menu-tier-2"></ul>');
        $.each(player.children, function(imonster, monster) {
            var $monster = $(templates.monster.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.current));
            $monster.find('input').attr('max', monster.hp.max);
            $encounter.find('.quick-menu').append($monster);
        });
    }

    $('#tbGroupInitiativeTracker .tb-manager-content > ul.quick-menu').append($encounter);

    $('#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu').sortable('destroy');
    $('#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu').sortable({
        animation: 100,
        onUpdate: function (evt) {
            saveInitiative();
        }
    });
    
    saveInitiative();
}
var currentHP = 0;
$('body').on('focus', '#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu input[type="number"]', function(evt) {
    currentHP = $(this).val() * 1;
})
$('body').on('keypress', '#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu input[type="number"]', function(evt) {
    if (evt.which == 13) {
        $(this).blur();
    }
});
$('body').on('blur', '#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu input[type="number"]', function(evt) {
    var newValue = $(this).val() * 1;
    if (newValue < 0) {
        $(this).val(currentHP + newValue);
    }
    currentHP = 0;
    saveInitiative();
});
$('body').on('click', '#tbGroupInitiativeTracker .tb-manager-content ul.quick-menu .remove', function(evt) {
    $(this).closest('li').remove();
    saveInitiative();
});

// ADD ENCOUNTER TO INITIATIVE TRACKER
$('body').on('click', '.tb-toolbox #tbGroupEncounters .collapsible-header-el .collapsible-heading-callout button', function(evt) {
    var $encounter = $(this).closest('.collapsible'),
        $list = $encounter.find('.collapsible-body ul.quick-menu'),
        encounter = {
            name: $encounter.find('.collapsible-header-el .collapsible-heading').text(),
            desc: '',
            xp: 0, 
            monsters: 0
        },
        monsters = [];

    $list.find('li').each(function(index, monster) {
        var $monster = $(monster),
            monster = {
                url: $monster.find('.quick-menu-item-link').data('href'),
                name: $monster.find('.quick-menu-item-link span').text(),
                ac: $monster.find('.quick-menu-item-link').data('ac') * 1,
                xp: $monster.find('.quick-menu-item-link').data('xp') * 1,
                hp: { 
                    max: $monster.find('input[name="encounter-monster-max-health"]').val() * 1,
                    current: $monster.find('input[name="encounter-monster-max-health"]').val() * 1
                }
            };

        encounter.xp += monster.xp;
        encounter.monsters++;

        monsters.push(monster);
    });
    encounter.desc = "Monsters: {0} | XP: {1}".format(encounter.monsters, encounter.xp);

    var player = {
        url: '#{0}'.format(encounter.name),
        name: encounter.name, 
        player: encounter.desc,
        children: monsters
    };

    __INITIATIVE.push(player);

    buildInitiative(player);

})
// REMOVE MONSTER FROM ENCOUNTER
$('body').on('mouseover', '.tb-toolbox .tb-manager-content .quick-menu .quick-menu-item .quick-menu-item-link > a.monster-page', function(evt) {
    var $tooltip = $('.tb-toolbox > #tbTooltip'),
        tooltipURL = $(this).attr('href');

    $tooltip.load('{0} .mon-stat-block'.format(tooltipURL), function() {
        $tooltip.append('<div class="remove">&times;</div>');
        $('.tb-toolbox').append($tooltip);
        rebind__tip();
    });
});
$('body').on('mouseleave', '.tb-toolbox', function() {
    $('.tb-toolbox > #tbTooltip > div').remove();
});
$('body').on('click', '.tb-toolbox > #tbTooltip > .remove', function(evt) {
    evt.preventDefault();
    $(this).closest('.tb-toolbox').find('#tbTooltip > div').remove();
});

// REMOVE MONSTER FROM ENCOUNTER
$('body').on('click', '.tb-toolbox #tbGroupEncounters .tb-manager-content .quick-menu .quick-menu-item .remove', function(evt) {
    evt.preventDefault();
    var $list = $(this).closest('ul');
    $(this).closest('li').remove();
    saveEncounter($list );
});
// REMOVE ENCOUNTER
$('body').on('click', '.tb-toolbox #tbGroupEncounters .tb-manager-content .tb-manager-item-remove', function(evt) {
    evt.preventDefault();
    var key = $(this).closest('.collapsible').find('.collapsible-heading').text();
    $(this).closest('.collapsible').remove();
    delete __ENCOUNTERS[key];
    tbSave('encounters', __ENCOUNTERS);
})
// ADD ENCOUNTER
$('body').on('click', '.mon-stat-block__name > .tb-btn > i.tb-swords-and-shield, #tbGroupEncounters .tb-manager-header .character-button', function(evt) {
    evt.preventDefault();
    var $monsterStats = $(evt.currentTarget).closest('.mon-stat-block'),
        monster = {
            url: '#CustomMonster',
            name: 'Example Monster',
            ac: '10',
            xp: '100',
            hp: { fixed: '10', rolled: '0d0+10' }
        };

    if ($(evt.currentTarget).hasClass('tb-swords-and-shield')) {
        monster = {
            url: $monsterStats.find('.mon-stat-block__name-link').attr('href'),
            name: $monsterStats.find('.mon-stat-block__name-link').text(),
            ac: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(1) .mon-stat-block__attribute-data-value').text()),
            xp: $.trim($monsterStats.find('.mon-stat-block__tidbits .mon-stat-block__tidbit:last-child .mon-stat-block__tidbit-data').text()).match(/\(([^)]+)\)/gi, '')[0].replace(/[.,]|\(|\)|\sXP/gi, ''),
            hp: { 
                fixed: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(2) .mon-stat-block__attribute-data-value').text()), 
                rolled: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(2) .mon-stat-block__attribute-data-extra').text()).replace(/\(|\)|\s/g,'')
            }
        };
    }

    var content = ['<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Encounter</label>',
                '<input type="text" name="encounter-name" class="tb-control" autocomplete="off" placeholder="Encounter" list="tbEncounters">',
            '</div>',
        '</div>',
        '<div class="tb-input-group">',
            '<div class="tb-form-field">',
                '<label>Quanity</label>',
                '<input type="number" name="encounter-monster-quanity" class="tb-control" value="1" min="1" autocomplete="off" placeholder="Monster Quanity" style="width: 70px;">',
            '</div>',
            '<div class="tb-form-field tb-f-grow">',
                '<label>Monster Name</label>',
                '<input type="text" name="encounter-monster-name" class="tb-control" value="{1}" autocomplete="off" placeholder="Monster Name">',
            '</div>',
            '<div class="tb-form-field">',
                '<label>AC</label>',
                '<input type="number" name="encounter-monster-ac" class="tb-control" value="{2}" autocomplete="off" placeholder="Armor Class" style="width: 70px;">',
            '</div>',
            '<button class="tb-btn">Fixed ({2})</button>',
        '</div>',
        '<div class="tb-input-group">',
            '<div class="tb-form-field">',
                '<div class="tb-form-field">',
                    '<label>XP</label>',
                    '<input type="number" name="encounter-monster-xp" class="tb-control" value="{5}" placeholder="Monster XP">',
                '</div>',
            '</div>',
            '<div class="tb-form-field tb-f-grow">',
                '<label>Health</label>',
                '<input type="number" name="encounter-monster-max-health" class="tb-control" value="{3}" autocomplete="off" placeholder="Monster Health">',
            '</div>',
            '<button class="tb-btn">Fixed ({3})</button>',
            '<button class="tb-btn">Rolled ({4})</button>',
        '</div>',
        '<div class="tb-form-field">',
            '<div class="tb-form-field">',
                '<label>Monster URL</label>',
                '<input type="text" name="encounter-monster-url" class="tb-control" value="{0}" placeholder="Monster URL">',
            '</div>',
        '</div>',
        '<datalist id="tbEncounters">{6}</datalist>'].join('\n');

    var datalistEncounters = '';
    for (var key in __ENCOUNTERS) {
        datalistEncounters += '<option>{0}</option>'.format(key);
    }

    content = content.format(monster.url, monster.name, monster.ac, monster.hp.fixed, monster.hp.rolled, monster.xp, datalistEncounters);

    $('body').addClass('modal-shown').append($(modalTemplate.format(content, 'Encounter Builder', 'Add')));
    if (monster.name == 'Example Monster') {
        $('.fullscreen-modal-content .tb-btn').css('display', 'none');
    }

    $('.tb-modal .tb-btn').on('click', function(evt) {
        var value = $(this).text().replace(/fixed|rolled|\(|\)|\s/gi,''),
            rolledValue = droll.roll(value);

        if (!rolledValue) {
            $(this).closest('.tb-input-group').find('input').last().val(value);
        }else{
            $(this).closest('.tb-input-group').find('input').last().val(rolledValue.total);
        }
    });

    $('.fullscreen-modal-accept').on('click', function(evt) {
        var $content = $('.fullscreen-modal-content'),
            encounter = $content.find('input[name="encounter-name"]').val(),
            quanity = $content.find('input[name="encounter-monster-quanity"]').val(),
            monster = {
                url: $content.find('input[name="encounter-monster-url"]').val(),
                name: $content.find('input[name="encounter-monster-name"]').val(),
                ac: $content.find('input[name="encounter-monster-ac"]').val(),
                xp: $content.find('input[name="encounter-monster-xp"]').val(),
                hp: { 
                    max: $content.find('input[name="encounter-monster-max-health"]').val(),
                    current: $content.find('input[name="encounter-monster-max-health"]').val()
                }
            };

        if (encounter.length <= 0) {
            encounter = monster.name;
        }

        if (typeof __ENCOUNTERS[encounter] === 'undefined') {
            __ENCOUNTERS[encounter] = new Array();
        }

        for (iMonsters = 1; iMonsters <= quanity; iMonsters++) {
            __ENCOUNTERS[encounter].push(monster);
        }

        tbSave('encounters', __ENCOUNTERS);
        buildEncounters();
        $('.tb-modal-close').trigger('click');
    });
})

/* MONSTER AUDIO INFORMATION
=================================*/
$('body').on('click', '.tb-audio:not(.playing)', function() {
    var $audio = $(this).find('audio');

    $audio.on('play', function() {
        $(this).closest('.tb-audio').removeClass('paused').addClass('playing');
    }).on('ended', function() {
        $(this).closest('.tb-audio').removeClass('playing').addClass('paused');
    });

    $audio[0].play();
});




tbBuild();
