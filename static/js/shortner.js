//TODO: add trash for links user doesn't want to see.
const { Button } = polythene;
const { RaisedButton } = polythene;
const { RaisedButtonCSS } = polytheneCSS
const { FAB } = polythene;
const { Checkbox, Switch, Icon } = polythene
const { Dialog, Toolbar, ToolbarTitle } = polythene;
const { ButtonCSS } = polytheneCSS;
const { Snackbar } = polythene;
const { MaterialDesignSpinner } = polythene;
const { Notification } = polythene;
const { NotificationCSS } = polytheneCSS;
const stream = window.m.stream;


const { TextField } = polythene;

const main = document.querySelector('body');

ButtonCSS.addStyle(".bordered-button", {
    color_light_text: "#673ab7",
    color_light_border: "#673ab7",
    color_dark_text: "yellow",
    color_dark_border: "yellow"
})

RaisedButtonCSS.addStyle(".themed-raised-button", {
    color_light_background: "#ff1744",
    color_light_text: "#fff"
})
//TODO: add waiting to dataOperations so we disable buttons not to lose data;

// const SERVER = "http://dev.short:5000"

//check to see if has persian characters:
var DataOperations = {

    hasToken: function() {
        if (localStorage.token) {
            return true;
        } else
            return false;
    },

    isValidUser: function() {
        var response = false;
        if (this.hasToken()) {
            m.request({
                method: "GET",
                // headers: {"Content-Type": "application/json"},
                url: "/api/checkToken",
                headers: {
                    'Authorization': 'Bearer ' + localStorage.token,
                    'Content-Type': 'application/json'
                },
                extract: function(xhr, xhrOptions) {

                    response = (xhr.status != 200) ? false : true
                    console.log(response)

                }
            }).then(function(result) {
                return response
            })
        } else {
            return false
            console.log('No Token')
        }
    },

    newUser: function(EMAIL, PASSWORD) {
        data = JSON.stringify(Settings)
        m.request({
            method: "POST",
            // headers: {"Content-Type": "application/json"},
            url: "/api/newUser",
            data: {
                'EMAIL': EMAIL,
                'PASSWORD': PASSWORD,
                'SETTINGS': data,
            },
        }).then(function(result) {
            Settings.isLoggedIn = true;
            console.log(result)
            // if (result.response == 'ok') {
            //     Settings.isLoggedIn = true;
            // }
        })
    },
    load: function() {
        if (this.hasToken) {
            if (this.isValidUser) {
                m.request({
                    method: "GET",
                    // headers: {"Content-Type": "application/json"},
                    url: "/api/load",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.token,
                        'Content-Type': 'application/json'
                    },

                }).then(function(result) {
                    console.log('loaded', result)
                    return result
                })
            }
        }
    },
    saveDB: function() {

        data = JSON.stringify(Settings)

        if (Settings.isLoggedIn) {
            m.request({
                method: "POST",
                url: "/",
                data: {
                    'action': 'save',
                    'EMAIL': Settings.email,
                    'SETTINGS': data

                },
            }).then(function(result) {
                console.log(result)
            })
        }

    },
    login: function(EMAIL, PASSWORD) {
        // tempLinks = JSON.parse(localStorage.links); // get the current links added
        // console.log(tempSettings)

        m.request({
            method: "POST",
            url: "/login",
            data: {
                // 'action': 'login',
                'EMAIL': EMAIL,
                'PASSWORD': PASSWORD,

            },
        }).then(function(result) {
            console.log(">>>", result)
            // console.log(JSON.parse(result.Settings))
            //first copy current settings to s temp

            if (result.statusCode == 200) {
                _Settings = JSON.parse(result.Settings)
                console.log('Settings', _Settings.links)
                console.log('Token', result.accessToken)
                localStorage.setItem('token', result.accessToken)
                // console.log('TEMP Settings', tempLinks)
                // DataOperations.updateDB()
                // console.log(_Settings)

                // if(tempLinks.length>0){
                //     tempLinks.map(function(link){
                //         console.log('!@!@',link)
                //         _Settings.links.push(link)
                //     })
                // }
                Settings = _Settings
                Settings.isLoggedIn = true;
                Settings.email = EMAIL;
                Settings.password = PASSWORD;
                localStorage.setItem('isLoggedIn', JSON.stringify(_Settings.isLoggedIn))
                localStorage.setItem('email', JSON.stringify(_Settings.email))
                // localStorage.setItem('password', JSON.stringify(_Settings.password))
                localStorage.setItem('links', JSON.stringify(_Settings.links))
                localStorage.setItem('groups', JSON.stringify(_Settings.groups))
                Snackbar.show({ title: `وارد حساب کاربری خود شده‌اید.`, timeout: 2 })

            }

            // console.log(_Settings)
            // console.log(localStorage)

            Dialog.hide()
            // x=JSON.parse(JSON.stringify(result.Settings))
        })

    },
    updateDB: function() {
        if (this.hasToken) {
            if (this.isValidUser) {
                console.log('WILL UPDATE')
                data = JSON.stringify(Settings)
                m.request({
                    method: "POST",
                    url: "/api/update",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.token,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        'SETTINGS': data
                    },
                }).then(function(result) {
                    console.log(result)
                    console.log('updateDB')
                    return
                })
            }

        }
        // console.log('not logged in')


    }
}

function isFarsi(s) {
    if (typeof s == 'string') {
        var PersianOrASCII = /[آ-ی]|([a-zA-Z])/;
        if ((result = s.match(PersianOrASCII)) !== null) {
            if (result[1]) {
                return false;
            } else { return true; }
        } else { return true; }
    }
}

// localStorage.links!=undefined?Settings.links=JSON.parse(localStorage.links):[]

var Settings = {
    links: [],
    groups: [],
    isLoggedIn: false
}

// ButtonCSS.addStyle(".bordered-button", {
//     color_light_text: "#03a9f4",
//     color_light_border: "#03a9f4",
//     color_dark_text: "#03a9f4",
//     color_dark_border: "#03a9f4"
// });


var linksList = {
    disableStatButton: false,
    // trashClicked: false,
    getStatistics: function(shortUrl) {
        self = this;
        self.disableStatButton = true;
        m.request({
                method: "POST",
                url: "/",
                data: { 'shortUrl': shortUrl, 'action': 'getStatistics' },
            })
            .then(function(result) {
                click = result['click']
                console.log(result)
                const optionsFn = () => ({
                    title: `این لینگ ${click} بار کلیک شده است.`
                })

                Notification.show(optionsFn).then(function() {
                    self.disableStatButton = false;

                });
                // Snackbar.show({ title: `این لینگ ${click} بار کلیک شده است.`, timeout: 2 })
            })
        // console.log(id)
    },

    addLink: function(li) {
        Settings.links.push(li)
        console.log('>>', JSON.stringify(Settings.links))
        localStorage.setItem('links', JSON.stringify(Settings.links))
        DataOperations.updateDB()
    },

    copy: function(element) {
        var range = document.createRange();
        range.selectNode(element);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy')
        window.getSelection().removeAllRanges();

    },

    oncreate: function(vnode) {
        this.containers = vnode.dom
        // this.groupName = vnode.attrs.group == undefined ? false : vnode.attrs.group['name']

        // dragObj = dragula([].slice.apply(document.querySelectorAll('.bloc')), {

        // }).on('drop', function(el, target, source, sibling) {
        //     var idx = el.dataset.idx;
        //     Settings.links[idx]['group'] = target.dataset.group
        //     localStorage.setItem('links', JSON.stringify(Settings.links))
        // })

    },

    view: function(vnode) {
        var self = this
        return m('article.grid-container.main',
            m('.grid-x align-center',
                m('.cell.medium-12',
                    m('table.unstriped.responsive-card-table',
                        m('thead',
                            m('tr',
                                m('th', 'عنوان لینک'),
                                m('th', 'لینک بلند'),
                                m('th', 'لینک کوتاه شده'),
                                m('th', 'عملیات'),
                            )
                        ),
                        m('tbody', Settings.links.map(function(link, i) {
                            // console.log(link)
                            var Length = 30

                            var title = link['title'] //title
                            var lLink = link['longUrl'] //long url
                            if (title.length > 30) {
                                title = title.substring(0, Length)
                                title += '...'
                            }
                            if (lLink.length > 30) { //shorten long url for display
                                _lLink = lLink.substring(0, Length);
                                _lLink += '...'
                            } else {
                                _lLink = lLink.substring(0, Length);
                            }
                            var titleCssTag
                            // get rtl ltr for parts of the table
                            isFarsi(title) ? titleClass = '.rtl' : titleClass = '.ltr'

                            return (vnode.attrs.group == link['group']) ? m('tr.bloc--inner', {
                                    'data-idx': i,
                                    'data-idu': link['id']
                                }, [m('td' + titleClass, { 'data-label': 'عنوان' },
                                        m('span', {
                                            'data-tooltip': '',
                                            tabindex: "1",
                                            title: link['title'], //original title
                                            'has-tip-cursor': false
                                        }, title)),
                                    // m('td.ltr', { 'data-label': 'لینک بلند' }, m('a', { 'href': lLink }, decodeURI(lLink)))
                                    m('td.ltr', { 'data-label': 'لینک بلند' },
                                        m('a', { 'href': lLink }, _lLink))
                                ],
                                m('td.ltr', { 'data-label': 'لینک کوتاه' }, m('i.fa fa-copy fa-2x.copyButton', {
                                        onclick: function() {
                                            //copy to clipboard
                                            self.copy(this.nextSibling)
                                            Snackbar.show({ title: "لینک کوتاه کپی شد.", timeout: 0.5 })
                                        }
                                    }),
                                    m('a', { 'href': link['shortUrl'] },
                                        link['shortUrl'])
                                ),
                                m('td.controls', { 'data-label': 'دسته‌بندی' }, m(groupsControls, { 'idx': i }),
                                    vnode.attrs.trash == undefined ? m('.trashButton', {
                                        onclick: function() {
                                            Settings.links[i].group = 'زباله';
                                            localStorage.setItem('links', JSON.stringify(Settings.links))
                                            DataOperations.updateDB()
                                            Dialog.hide()
                                        }
                                    }, m('i.fa fa-trash'), m('span', 'زباله')) : null,
                                    m('.trashButton', {
                                            onclick: function() {
                                                console.log(self.disableStatButton)
                                                if (self.disableStatButton) {
                                                    console.log('disabled')
                                                    return;
                                                } else {
                                                    self.disableStatButton = true;
                                                    self.getStatistics(link['shortUrl'])
                                                }

                                            }
                                        },

                                        m('i.fa fa-chart-line'), m('span', 'آمار')))



                            ) : null
                        }))))))
    }
}

var groupsControls = {
    view: function(vnode) {
        var groups = Settings.groups
        var idx = vnode.attrs.idx //the data.idx which shows the index in the links Object
        var hasGroup = Settings.links[idx]['group'] != undefined // check if is in group

        return [m('select.dropDown', {
            onchange: function(e) {
                // select box change value...
                var selectedGroup = e.target.value
                Settings.links[idx]['group'] = selectedGroup
                localStorage.setItem('links', JSON.stringify(Settings.links))
                DataOperations.updateDB()
                Snackbar.show({ title: `لینک مورد نظر به گروه ${selectedGroup} انتقال یافت.`, timeout: 2 })
                // console.log('here')

                Dialog.hide()
            }
        }, [m('option', {
                'selected': true,
                'style': "display:none;"
            }, 'انتقال به ...'),
            groups.map(function(group) {
                return m('option', group['name'])
            })
        ]), hasGroup ? m('i.fa fa-unlink fa-2x', {
            // works by checking tag data attribute || since in modal cant be a button
            onclick: function() {
                //remove link group
                console.log(vnode.attrs.idx)
                Settings.links[idx]['group'] = undefined
                localStorage.setItem('links', JSON.stringify(Settings.links))
                DataOperations.updateDB()
                Dialog.hide()
                Snackbar.show({ title: "لینک از دسته‌بندی حذف و به بخش بدون دسته‌بندی بازگردانیده شد.", timeout: 2 })
            }
        }) : null]
    }
}

var urlInput = {
    val: '',
    waiting: false,

    sendUrl: function(longUrl) {
        var self = this;
        //Ajax the longurl to backend
        console.log(longUrl)
        m.request({
                method: "POST",
                url: "/",
                data: { 'longUrl': longUrl, },
            })
            .then(function(result) {
                self.val = ''
                self.inputBox.value = ''
                console.log()
                console.log(result)
                var status = result['status'];

                self.waiting = false;
                if (status == 'ok') {
                    Snackbar.show({ title: "لینک با موفقیت به لیست اضافه شد.", timeout: 2 })
                    linksList.addLink(result)
                } else if (status == '101') {
                    Snackbar.show({ title: "لینک مورد نظر باز نشد.", timeout: 2 })
                } else {
                    Snackbar.show({ title: "نتاسفانه با خطایی روبرو شده‌ایم.", timeout: 2 })
                }
            })
    },

    view: function(argument) {
        var self = this;

        return [m('h2.subheader', 'لینک‌هایتان را کوتاه کنید'),
            m('.text-center grid-x',
                m('.medium-5.small-12 cell',
                    m('label',
                        //TODO: create on change instead of keyup,down...
                        //TODO: empty after new link creation
                        m('input.urlInput[type=text]', {
                            'placeholder': 'لینکتان را وارد کنید... ',
                            oncreate: function(vnode) {
                                console.log(vnode.dom)
                                self.inputBox = vnode.dom;
                            },

                            onchange: function() {
                                self.val = this.value
                            },
                            onkeyup: function() {
                                self.val = this.value
                            },
                            onkeydown: function(e) {
                                if (e.keyCode == 13) {
                                    // console.log(decodeURI(this.value))
                                    // self.sendUrl(encodeURI(this.value))
                                    self.sendUrl(this.value)
                                    self.waiting = true;
                                }
                            }
                        }))),
                m('.medium-1 cell align-left mainBtn .small-12',

                    m(RaisedButton, {
                        label: "کوتاه کن",

                        className: "themed-raised-button",
                        z: 2,
                        style: {
                            backgroundColor: '#e6e6e6',
                            color: "#000",
                        },
                        border: true,
                        events: {
                            onclick: function() {
                                console.log(self.val)
                                // self.sendUrl(encodeURI(self.val))
                                self.sendUrl(self.val)
                                self.waiting = true

                            }
                        }

                    })
                ),
                m(MaterialDesignSpinner, {
                    singleColor: true,
                    show: self.waiting,
                    size: 'large',
                    raised: true
                })
            )
        ]
    }
}

var groups = {
    colapseIcon: '+',
    showNewGroup: false,
    val: '',
    removeFromGroup: function(group) {
        // console.log(Settings.links, group)
        //remove from links
        Settings.links.map(function(link) {
            link.group == group ? link.group = null : null
            localStorage.setItem('links', JSON.stringify(Settings.links))
            DataOperations.updateDB()

        })
        //remove from groups
        keys = Object.keys(Settings.groups)
        keys.map(function(key) {
            // console.log(count, keys.length)
            //don't know why I have to check if not undefined
            if (Settings.groups[key] && Settings.groups[key]['name'] == group) {
                Settings.groups.splice(key, 1)
                localStorage.setItem('groups', JSON.stringify(Settings.groups))
                DataOperations.updateDB()

            }

        })
        Snackbar.show({ title: "دسته‌بندی مورد نظر حذف گردید و تمامی محتوای آن بصورت بدون‌دسته شد.", timeout: 3 })
    },
    view: function() {
        var groups = Settings.groups
        var links = Settings.links
        var self = this;
        return m('#right.bloc bloc--first.grid-y grid-padding-x', {
                style: { 'height': '100%' }
            },
            m('.cell shrink',
                m('img.thumbnail', { 'src': './static/images/indx_logo_min.png' })),
            m('.cell.auto',
                m('h5.sidebarTitle',
                    m('i.fa fa-align-justify'), 'دسته بندی'),
                m('ul.categories',
                    m('li', {
                            onclick: function() {
                                console.log('<<<Trash>>>')
                                const confirmDialog = {
                                    backdrop: true,

                                    header: m(Toolbar, {
                                        content: [
                                            m(ToolbarTitle, { text: "دسته " + 'زباله' })
                                        ]
                                    }),
                                    body: "مطمئنید که گروه زباله را میخواهید حذف کنید؟",
                                    footerButtons: [
                                        m(Button, {
                                            label: "حذف گروه",
                                            events: {
                                                onclick: function() {
                                                    // self.removeFromGroup(group['name'])
                                                    Dialog.hide()
                                                }
                                            }
                                        }),
                                        m(Button, {
                                            label: "بازگشت",
                                            // element: "button",
                                            events: {
                                                onclick: function() {

                                                    Dialog.show(table)
                                                }
                                            }
                                        })
                                    ]

                                }
                                const table = {
                                    backdrop: true,
                                    // footerButtons,
                                    header: m(Toolbar, {
                                        content: [
                                            m(ToolbarTitle, { text: "دسته زباله" })
                                        ]
                                    }),
                                    body: m(linksList, { 'group': 'زباله', trash: true }),

                                }

                                Dialog.show(table)
                                localStorage.setItem('groups', JSON.stringify(Settings.groups))
                                DataOperations.updateDB()

                            }

                        }, m('i.fa.fa-trash'),
                        m('a', 'زباله')
                    ), groups.map(function(group) {

                        return [m('li', {
                                onclick: function() {
                                    const footerButtons = [
                                        m(Button, {
                                            label: "حذف گروه",
                                            events: {
                                                onclick: () =>
                                                    Dialog.show(confirmDialog, {
                                                        name: group['name']
                                                    })
                                            }
                                        })
                                    ]

                                    const confirmDialog = {
                                        backdrop: true,

                                        header: m(Toolbar, {
                                            content: [
                                                m(ToolbarTitle, { text: "دسته " + group['name'] })
                                            ]
                                        }),
                                        body: "مطمئنید که گروه " + group['name'] + " را میخواهید حذف کنید؟",
                                        footerButtons: [
                                            m(Button, {
                                                label: "حذف گروه",
                                                events: {
                                                    onclick: function() {
                                                        console.log(group['name'])
                                                        self.removeFromGroup(group['name'])
                                                        Dialog.hide()
                                                    }
                                                }
                                            }),
                                            m(Button, {

                                                label: "بازگشت",
                                                // element: "button",
                                                events: {
                                                    onclick: function() {
                                                        console.log('aaaaa')
                                                        Dialog.show(table)
                                                    }
                                                }
                                            })
                                        ]

                                    }
                                    const table = {
                                        backdrop: true,
                                        footerButtons,
                                        header: m(Toolbar, {
                                            content: [
                                                m(ToolbarTitle, { text: "دسته " + group['name'] })
                                            ]
                                        }),
                                        body: m(linksList, { 'group': group['name'] }),

                                    }

                                    Dialog.show(table)
                                    localStorage.setItem('groups', JSON.stringify(Settings.groups))
                                    DataOperations.updateDB()

                                }
                            },
                            group.colapse ? self.colapseIcon : m('i.fa.fa-angle-left'),
                            m('a.bloc.bloc--inner', {
                                'data-group': group['name']
                            }, group['name'])
                        )]
                    }))), [self.showNewGroup ? m('.newGroup',
                m('input#newGroupInput', {
                    placeholder: 'نام دسته‌بندی ...',
                    oncreate: function(vnode) {
                        vnode.dom.focus()
                    },
                    onkeyup: function(e) {
                        // console.log(this.value)
                        if (e.keyCode == 13) {
                            Settings.groups.push({ 'name': self.val })
                            localStorage.setItem('groups', JSON.stringify(Settings.groups))
                            DataOperations.updateDB()
                            self.showNewGroup = !self.showNewGroup
                            Snackbar.show({ title: "دسته‌بندی " + self.val + " ایجاد شد.", timeout: 2 })

                        }
                        self.val = this.value
                    }
                }), m(Button, {
                    label: 'ایجاد',
                    border: true,
                    className: "bordered-button.submitButton",
                    style: {
                        backgroundColor: '#5AAC44',
                        color: "#fff",
                        fontFamily: 'sans_m',
                    },
                    events: {
                        onclick: function() {
                            Settings.groups.push({ 'name': self.val })
                            localStorage.setItem('groups', JSON.stringify(Settings.groups))
                            DataOperations.updateDB()
                            self.showNewGroup = !self.showNewGroup
                            Snackbar.show({ title: "دسته‌بندی " + self.val + " ایجاد شد.", timeout: 2 })
                        }
                    }

                }), m('a.closeGroup', m('i.fa fa-times fa-2x', {
                    onclick: function() {
                        self.showNewGroup = !self.showNewGroup
                    }
                }))

            ) : null, m('a.addCategory secondary', {
                onclick: function() {
                    self.showNewGroup = !self.showNewGroup


                }
            }, m('i.fa fa-plus'), 'دسته‌بندی جدید')])
    }
}

var search = {
    found: [],
    view: function() {
        var self = this
        return [m('.searchBox',
            m('input.searchInput', {
                placeholder: 'جستجو ...',
                onkeydown: function() {
                    self.found = []
                },
                onkeyup: function(e) {

                    self.found = []
                    var searchString = e.target.value.toLowerCase();
                    if (searchString == "" || searchString == "|")
                        return
                    // try {
                    //     re = new RegExp(`${searchString}`, "g");
                    //     // re = searchString.indexOf()
                    // } catch (e) {
                    //     console.log(e)
                    //     return
                    // }
                    Settings.links.map(function(link, i) {
                        result = link['title'].toLowerCase().indexOf(searchString)
                        console.log(searchString, result)
                        if (result > -1) {
                            // console.log('>>>',Settings.links[i].group);
                            //return if in trashcan
                            if (Settings.links[i].group == 'زباله')
                                return
                            console.log('FOUND', self.found)
                            self.found.push(Settings.links[i])
                        }
                        // console.log(link)
                        // do {
                        //     try {
                        //         result = re.exec(link['title'].toLowerCase());
                        //         // result = link['title'].indexOf(searchString)
                        //         console.log(">>",link['title'].indexOf(searchString),result)
                        //     } catch (e) {
                        //         console.log('ohoh')
                        //         return
                        //     }

                        //     if (result) {
                        //         // console.log('>>>',Settings.links[i].group);
                        //         //return if in trashcan
                        //         if(Settings.links[i].group=='زباله') 
                        //             return 
                        //         console.log('FOUND',self.found)
                        //         self.found.push(Settings.links[i])
                        //     }

                        // } while (result);

                    })

                }
            }), (self.found.length > 0) ? m('.searchResult',
                m('ul', self.found.map(function(link) {
                    // console.log(link)
                    return m('li', m('a', { href: link['longUrl'] }, link['title']))
                }))) : null, m('i.fa fa-search'))]
    }
}

var header = {
    oncreate: function() {
        this.iconSVG = '<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\
                        <path stroke="#366ed1" d="M14.023,12.154c1.514-1.192,2.488-3.038,2.488-5.114c0-3.597-2.914-6.512-6.512-6.512\
                                c-3.597,0-6.512,2.916-6.512,6.512c0,2.076,0.975,3.922,2.489,5.114c-2.714,1.385-4.625,4.117-4.836,7.318h1.186\
                                c0.229-2.998,2.177-5.512,4.86-6.566c0.853,0.41,1.804,0.646,2.813,0.646c1.01,0,1.961-0.236,2.812-0.646\
                                c2.684,1.055,4.633,3.568,4.859,6.566h1.188C18.648,16.271,16.736,13.539,14.023,12.154z M10,12.367\
                                c-2.943,0-5.328-2.385-5.328-5.327c0-2.943,2.385-5.328,5.328-5.328c2.943,0,5.328,2.385,5.328,5.328\
                                C15.328,9.982,12.943,12.367,10,12.367z"></path>\
                        </svg>'

    },
    view: function() {
        // console.log('1111',Settings.isLoggedIn)
        return m('.top-bar',
            m('.top-bar-left',
                m('ul.menu align-right',
                    m('li.menu-text logo', 'iNDX.iR', m(search)),
                    m('li', Settings.isLoggedIn ?

                        m('i.fa.fa-user.loginIcon', {
                            onclick: function() {
                                Settings = {
                                    links: [],
                                    groups: [],
                                    isLoggedIn: false
                                }

                                Settings.isLoggedIn = false;
                                localStorage.setItem('isLoggedIn', false)
                                localStorage.clear();
                            }
                        }, 'خروج') 
                        // : m(FAB, {

                        //     icon: { svg: { content: m.trust(this.iconSVG) } },

                        //     className: "themed-raised-button",
                        //     z: 2,
                        //     style: {
                        //         backgroundColor: '#cccccc',
                        //         color: "#000",
                        //     },
                        //     border: true,
                        //     events: {
                        //         onclick: function() {
                        //             mainView.showLogin = true;

                        //         }
                        //     }

                        // }))
                    :[m('i.fa.fa-user.loginIcon', {
                        onclick: function() {
                            console.log('Here')

                            mainView.showLogin = true;
                        }
                    }), m('a', {
                        onclick: function() {
                            console.log('Here')

                            mainView.showLogin = true;
                        }
                    }, m('span', 'ثبت نام / ورود'))])
                )
            )
        )
    }
}

var footer = {
    view: function() {
        return m('footer',
            m('.grid-x callout secondary',
                m('.medium-6 cell',
                    m('ul.menu align-left',
                        // m('li', m('a', 'سیاست‌ها')),
                        // m('li', m('a', 'سیاست‌ها')),
                        // m('li', m('a', 'سیاست‌ها')),
                    )),
                m('.medium-6 cell',
                    m('ul.menu align-right',
                        m('li.menu-text', m('a', 'کپی‌رایت ۲۰۱۸')))
                )
            ))
    }
}

var mobileMenu = {
    view: function() {
        return m('.title-bar hide-for-large',
            m('.title-bar-right',
                m('.menu-icon', {
                    type: 'button',
                    'data-toggle': 'my-info',
                    'aria-expanded': 'false',
                    'aria-controls': 'my-info'
                }, m('span.title-bar-title', 'دسته‌بندی‌ها'))

            )
        )
    }
}
const SwitchToggle = {
    oninit: vnode => {
        const checked = stream(false);
        vnode.state = {
            checked
        };
    },
    view: vnode => {
        const state = vnode.state;
        const checked = state.checked();
        return m("div", [
            m(Switch, {
                label: "Label",
                onChange: newState => state.checked(newState.checked),
                checked
            }),
            m("div", { style: { marginTop: "1rem" } },
                m(RaisedButton, {
                    label: "Toggle",
                    events: {
                        onclick: () => state.checked(!checked)
                    }
                })
            )
        ]);
    }
};



var login = {
    email: '',
    validPass: true,
    password: '',
    passwordRepeat: '',
    newUser: true,
    buttonText: 'ورود',
    passMatch: true,

    oninit: vnode => {
        const checked = stream(false);
        vnode.state = {
            checked
        };
    },

    onupdate: function(vnode) {
        var self = this;
        const state = vnode.state;
        const checked = state.checked();
        const footerButtons = [

            m(Checkbox, {
                label: "کار بر جدید",
                onChange: function(newState) {
                    console.log(newState.checked)
                    state.checked(newState.checked)
                    self.newUser = !self.newUser
                },
                checked
            }),
            self.newUser ? m(RaisedButton, {
                z: 2,
                style: {
                    backgroundColor: '#a9d6fb',
                    color: "#000",
                },
                border: true,
                label: "حساب جدید",
                // element: "button",
                events: {
                    onclick: function() {
                        console.log(self.newUser)
                        self.newUser = !self.newUser
                        DataOperations.newUser(self.email, self.password)
                        Dialog.hide()

                    }
                }
            }) :
            m(RaisedButton, {
                label: 'ورود',
                z: 2,
                style: {
                    backgroundColor: '#e6e6e6',
                    color: "#000",
                },
                type: "submit",
                events: {
                    onclick: function() {
                        console.log(self)
                        // console.log()
                        Settings.email = self.email;
                        DataOperations.login(self.email, self.password);



                    }

                }
            }),
            m(RaisedButton, {
                label: "بازگشت",
                z: 2,
                style: {
                    backgroundColor: '#e6e6e6',
                    color: "#000",
                },
                events: {
                    onclick: function() {
                        Dialog.hide()
                    }
                }
            })
        ]

        loginDialog = {

            backdrop: true,
            footerButtons,
            header: m(Toolbar, {
                content: [m('h4.pe-toolbar__title', 'ثبت نام / ورود')]
            }),
            body: m('',
                m(TextField, {
                    label: "آدرس ایمیل",
                    required: true,
                    floatingLabel: true,
                    autofocus: true,
                    type: 'email',
                    error: 'لطفا یک ایمیل صحیح وارد کنید.',
                    events: {
                        oninput: function() {
                            console.log(this.value)
                            self.email = this.value
                            // self.validEmail = login.validateEmail(self.email)
                        }
                    }


                }),
                m(TextField, {
                    label: "رمز عبور",
                    type: 'password',

                    maxlength: 24,
                    required: true,
                    floatingLabel: true,
                    valid: self.validPass,
                    error: 'رمز عبور با حداقل ۶ کاراکتر وارد کنید.',
                    events: {
                        oninput: function() {
                            self.password = this.value
                            console.log(self.password.length)
                            if (self.password.length < 6) {
                                self.validPass = false;
                            } else {
                                self.validPass = true;
                            }
                        }
                    }
                }),
                self.newUser ? m(TextField, {
                    label: "تکرار رمز",
                    required: true,
                    floatingLabel: true,
                    type: 'password',
                    error: 'رمز عبورها عین هم نیستند',
                    valid: self.passMatch,
                    events: {
                        oninput: function() {
                            self.passwordRepeat = this.value
                            console.log(self.password.length, this.value)
                            if (self.password == self.passwordRepeat) {
                                self.passMatch = true
                            } else {
                                self.passMatch = false
                            }

                        }
                    }
                }) : null,

            ),
            didHide: function() {
                // console.log(self)
                mainView.showLogin = false;
            }

        }

        Dialog.show(loginDialog)
    },

    view: function(vnode) {
        return
    }


}

var log = {
    view: function() {
        return [m('', {
                    onclick: function() {
                        data = JSON.stringify(Settings)
                        console.log('create', data)
                        m.request({
                            method: "POST",
                            // headers: {"Content-Type": "application/json"},
                            url: "/",
                            data: {
                                'action': 'newUser',
                                'EMAIL': 'a@b.com',
                                'PASSWORD': '123',
                                'SETTINGS': data,
                            },
                        }).then(function(result) {
                            console.log(result)
                        })
                    }
                },
                'Create'),
            m('', {
                onclick: function() {
                    // console.log('login')
                    m.request({
                        method: "POST",
                        url: "/",
                        data: {
                            'action': 'login',
                            'EMAIL': 'a@b.com',
                            'PASSWORD': '123',

                        },
                    }).then(function(result) {
                        // console.log(result)
                        console.log(JSON.parse(result.Settings))
                        Settings = JSON.parse(result.Settings)
                        // x=JSON.parse(JSON.stringify(result.Settings))
                    })
                }
            }, 'login'),
            m('', {
                onclick: function() {
                    data = JSON.stringify(Settings)
                    console.log('hi')
                    m.request({
                        method: "POST",
                        url: "/",
                        data: {
                            'action': 'save',
                            'EMAIL': 'a@b.com',
                            'SETTINGS': data

                        },
                    }).then(function(result) {
                        console.log(result)
                    })
                }
            }, 'Update'),
            m('', {
                onclick: function() {
                    console.log('hi')
                    m.request({
                        method: "POST",
                        url: "/",
                        data: {
                            'action': 'load',
                            'EMAIL': 'a@b.com',
                            'PASSWORD': Settings.password
                            // 'SETTINGS': Settings

                        },
                    }).then(function(result) {
                        console.log(result)
                        Settings = JSON.parse(result.Settings)
                    })
                }
            }, 'Load')
        ]


    }
}

var mainView = {
    showLogin: false,
    oninit: function() {
        if (localStorage.links != undefined)
            Settings.links = JSON.parse(localStorage.links)
        if (localStorage.groups != undefined)
            Settings.groups = JSON.parse(localStorage.groups)
        if (localStorage.isLoggedIn != undefined) {
            Settings.isLoggedIn = JSON.parse(localStorage.isLoggedIn)
            if (localStorage.email != undefined)
                Settings.email = JSON.parse(localStorage.email)
            // if (localStorage.password != undefined)
            //     Settings.password = JSON.parse(localStorage.password)

        }



    },
    oncreate: function() {
        $(document).foundation()
        $('[class^="pe"]').css('width', '100%');
        // console.log(this.showLogin)
    },
    view: function(vnode) {
        var self = this;
        return m('.start', { 'dir': 'rtl' },
            m('#my-info.group.col-2.block.off-canvas position-right reveal-for-large is-transition-push', {
                'data-off-canvas': "",
                'aria-hidden': "false",
                "data-e": "0jwz1v-e"
            }, m(groups)),
            m(mobileMenu),

            m('.off-canvas-content has-reveal-right', { 'data-off-canvas-content': "" },
                m(header),
                // m(log),
                m('.callout primary', m(urlInput),

                    self.showLogin ? m(login) : null), m(linksList),
                m(footer), m(Snackbar), m(Dialog), m(Notification))
        )
        // )
    }
}

m.route.prefix("")

m.route(main, "/", {
    "/": mainView,
    // "/post/:id/:title/:lang": postView
})