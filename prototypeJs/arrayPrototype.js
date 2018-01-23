/**
 * Created by bloodspasm on 2017/8/14.
 */
Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}

Array.prototype.containsValue = function (val) {
    var i = this.length;
    while (i--) {
        if (this[i] === val) {
            return true;
        }
    }
    return false;
}

Array.prototype.arrisEmpty = function () {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;

}