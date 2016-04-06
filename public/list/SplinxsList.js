/**
 * SplinxList
 * queue for storing guide - tourist string combinations
 * each combination is unique
 */
function SplinxsList() {
    var list = [];
    /**
     * gets the number of items in the list
     * @returns {number} number of items in the list
     */
    this.getLength = function () {
        return list.length;
    };
    /**
     * adds an item to the list, if it does not already exist
     * @param {Object{guide: string, tourist: string}} i item to add to the list
     */
    this.addItem = function (i) {
        if (this.containsItem(i) < 0) {
            add(i);
        }
    };
    /**
     * adds a guide tourist combination to the list, if it does not already exist
     * @param {string} g guide to add
     * @param {string} t string to add
     */
    this.addStrings = function (g, t) {
        if (this.containsStrings(g, t) < 0) {
            add({guide: g, tourist: t});
        }
    };
    /**
     * empties the list
     */
    this.clear = function () {
        list.length = 0;
    };
    /**
     * removes all items with the given guide from the list
     * @param {string} g guide to remove
     */
    this.removeGuide = function (g) {
        if (list.length > 0) {
            var guides = getAllGuides(g);
            if (guides.length > 0) {
                for (var i = 0; i < guides.length; i++) {
                    removeAtIndex(i);
                }
            }
        }
    };
    /**
     * removes all items with the given tourist from the list
     * @param {string} t tourist to remove
     */
    this.removeTourist = function (t) {
        if (list.length > 0) {
            var tourists = getAllTourists(t);
            if (tourists.length > 0) {
                for (var i = 0; i < tourists.length; i++) {
                    removeAtIndex(i);
                }
            }
        }
    };
    /**
     * removes all items with the given guide, tourist from the list
     * @param {string} g guide to remove
     * @param {string} t tourist to remove
     */
    this.removeStrings = function (g, t) {
        this.removeGuides(g);
        this.removeTourists(t);
    };
    /**
     * gets the item with the first occurence of the given guide
     * @param {string} g guide to search for
     * @returns {Object{guide: string, tourist: string}} item containing the first occurence of g
     */
    this.getFirstGuide = function (g) {
        var item = null;
        var index = containsGuide(g);
        if (index > -1) {
            item = list[index];
        }

        return item;
    };
    /**
     * gets the item with the first occurence of the given tourist
     * @param {string} t tourist to search for
     * @returns {Object{guide: string, tourist: string}} item containing the first occurence of t
     */
    this.getFirstTourist = function (t) {
        var item = null;
        var index = containsGuide(t);
        if (index > -1) {
            item = list[index];
        }
        return item;

    };
    /**
     * returns a number > -1 if the given guide is in the list
     * @param {string} g guide to search for
     * @returns {Number} index of the first guide or -1 if none exists
     */
    this.containsGuide = function (g) {
        var ret = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].guide == g) {
                ret = i;
                break;
            }
        }
        return ret;
    };
    /**
     * returns a number > -1 if the given tourist is in the list
     * @param {string} t tourist to search for
     * @returns {Number} index of the first tourist or -1 if none exists
     */
    this.containsTourist = function (t) {
        var ret = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].tourist == t) {
                ret = i;
                break;
            }
        }
        return ret;
    };
    /**
     * returns a number > -1 if the given item is in the list
     * @param {Object{guide: string, tourist: string}} i item to search for
     * @returns {Number} index of the first item or -1 if none exists
     */
    this.containsItem = function (i) {
        var ret = -1;
        for (var n = 0; n < list.length; n++) {
            if (list[n].guide == i.guide && list[n].tourist == i.tourist) {
                ret = n;
                break;
            }
        }
        return ret;
    };
    /**
     * returns a number > -1 if the given guide, tourist combination is in the list
     * @param {string} g guide to search for
     * @param {string} t tourist to search for
     * @returns {Number} index of the first occurence of the g, t combination or -1 if none exists
     */
    this.containsStrings = function (g, t) {
        var ret = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].guide == g && list[i].tourist == t) {
                ret = i;
                break;
            }
        }
        return ret;
    };
    /**
     * ------------------------useless----------------?
     * gets an item from the list or null if it is not in the list
     * @param {Object{guide: string, tourist: string}} i item to get
     * @returns {Object{guide: string, tourist: string}} returns the item from the list or null if it does not exist
     */
    this.getItem = function (i) {
        var ret = null;
        var index = this.containsItem(i);
        if (index > -1) {
            return list[index];
        }
        return ret;
    };
    /**
     * gets an array of all indexes where the guide could be found, might be empty
     * @param {string} g guide to search for
     * @returns {Array[int]} an array containing all the indexes where the guide could be found
     */
    function getAllGuides(g) {
        var ret = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].guide == g) {
                ret.push(i);
            }
        }
        return ret;
    }
    /**
     * gets an array of all indexes where the tourist could be found, might be empty
     * @param {string} t tourist to search for
     * @returns {Array[int]} an array containing all the indexes where the tourist could be found
     */
    function getAllTourists(t) {
        var ret = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].tourist == t) {
                ret.push(i);
            }
        }
        return ret;
    }
    /**
     * adds an item to the list
     * @param {Object{guide: string, tourist: string}} item to add
     */
    function add(item) {
        list.push(item);
    }
    /**
     * removes an item from the list
     * @param {Object{guide: string, tourist: string}} item to remove
     */
    this.removeItem = function (item) {
        var index = findIndex(item);
        if (index > -1) {
            removeAtIndex(index);
        }
    };
    /**
     * removes an item at the given index
     * @param {number} i index where the item should be removed
     */
    function removeAtIndex(i) {
        list.splice(i, 1);
    }
    /**
     * -------------------same as contains item-------------------?
     * returns a number > -1 if the item is in the list
     * @param {Object{guide: string, tourist: string}} item to search for
     * @returns {number} index of the item, -1 if there is none
     */
    function findIndex(item) {
        //callback for Array.findIndex()
        function matchItem(e, i, array) {
            return (e.guide === item.guide && e.tourist === item.tourist);
        }
        return list.findIndex(matchItem);
    }
}