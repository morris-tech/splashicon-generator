var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var ig = require('imagemagick');
var colors = require('colors');
var _ = require('underscore');
var Q = require('q');
var nodeFs = require('node-fs');

/**
 * Check which platforms are added to the project and return their icon names and sized
 *
 * @param  {String} projectName
 * @return {Promise} resolves with an array of platforms
 */
var getPlatformIcons = function() {
    var deferred = Q.defer();
    var platforms = [];

    //ok
    platforms.push({
        name: 'windows',
        iconsPath: 'resources/windows/icon/',
        isAdded: true,
        icons: [
            { name:'Square30x30Logo.scale-100.png', size:30 },
            { name:'Square30x30Logo.scale-200.png', size:60 },
            { name:'Square30x30Logo.scale-240.png', size:72 },
            { name:'Square30x30Logo.scale-400.png', size:120 },
            { name:'Square44x44Logo.scale-100.png', size:44 },
            { name:'Square44x44Logo.scale-200.png', size:88 },
            { name:'Square44x44Logo.scale-240.png', size:106 },
            { name:'Square44x44Logo.scale-400.png', size:176 },
            { name:'Square70x70Logo.scale-100.png', size:70 },
            { name:'Square70x70Logo.scale-200.png', size:140 },
            { name:'Square70x70Logo.scale-240.png', size:168 },
            { name:'Square70x70Logo.scale-400.png', size:280 },
            { name:'Square71x71Logo.scale-100.png', size:71 },
            { name:'Square71x71Logo.scale-200.png', size:142 },
            { name:'Square71x71Logo.scale-240.png', size:170 },
            { name:'Square71x71Logo.scale-400.png', size:284 },
            { name:'Square150x150Logo.scale-100.png', size:150 },
            { name:'Square150x150Logo.scale-200.png', size:300 },
            { name:'Square150x150Logo.scale-240.png', size:360 },
            { name:'Square150x150Logo.scale-400.png', size:600 },
            { name:'Square310x310Logo.scale-100.png', size:310 },
            { name:'Square310x310Logo.scale-200.png', size:620 },
            { name:'Square310x310Logo.scale-240.png', size:744 },
            { name:'StoreLogo.scale-100.png', size:50 },
            { name:'StoreLogo.scale-200.png', size:100 },
            { name:'StoreLogo.scale-240.png', size:120 },
            { name:'StoreLogo.scale-400.png', size:200 },
        ]
    });

    platforms = settings.ICON_PLATFORMS || platforms

    deferred.resolve(platforms);
    return deferred.promise;
};

/**
 * Check which platforms are added to the project and return their splash screen names and sizes
 *
 * @param  {String} projectName
 * @return {Promise} resolves with an array of platforms
 */
var getPlatformSplashs = function() {
    var deferred = Q.defer();
    var platforms = [];

    //ok
    platforms.push({
        name: 'windows',
        isAdded: true,
        splashPath: 'resources/windows/splash/',
        splash: [
            { width:620, height:300, name:"SplashScreen.scale-100.png" },
            { width:1240, height:600, name:"SplashScreen.scale-200.png" },
            { width:1488, height:720, name:"SplashScreen.scale-240.png" },
            { width:2480, height:1200, name:"SplashScreen.scale-400.png" },
            { width:480, height:800, name:"SplashScreenPhone.scale-100.png" },
            { width:960, height:1600, name:"SplashScreenPhone.scale-200.png" },
            { width:1152, height:1920, name:"SplashScreenPhone.scale-240.png" },
            { width:1920, height:3200, name:"SplashScreenPhone.scale-400.png" },
        ]
    });

    //ok
    platforms.push({
        name: 'windows_wide',
        isAdded: true,
        splashPath: 'resources/windows/icon/',
        splash: [
            { width: 310, height: 150, name:"Wide310x150Logo.scale-100.png" },
            { width: 620, height: 300, name:"Wide310x150Logo.scale-200.png" },
            { width: 744, height: 360, name:"Wide310x150Logo.scale-240.png" },
        ]
    });

    platforms = settings.SPLASH_PLATFORMS || platforms

    deferred.resolve(platforms);
    return deferred.promise;
};

/**
 * @var {Object} settings - names of the confix file and of the icon image
 * TODO: add option to get these values as CLI params
 */
var settings = {};
settings.ICON_FILE = path.join('resources', 'icon.png');
settings.SPLASH_FILE = path.join('resources', 'splash.png');

/**
 * @var {Object} console utils
 */
var display = {};
display.success = function(str) {
    str = '✓  '.green + str;
    console.log('  ' + str);
};
display.error = function(str) {
    str = '✗  '.red + str;
    console.log('  ' + str);
};
display.header = function(str) {
    console.log('');
    console.log(' ' + str.cyan.underline);
    console.log('');
};

/**
 * Resizes and creates a new icon in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} icon
 * @return {Promise}
 */
var generateIcon = function(platform, icon) {
    var deferred = Q.defer();
    try {
        var filePath = path.join(platform.iconsPath, icon.name);
        var filedirName = path.dirname(filePath);
        if (!fs.existsSync(filedirName)) {
            nodeFs.mkdirSync(filedirName, '0777', true);
        }
        ig.resize({
            srcPath: settings.ICON_FILE,
            dstPath: filePath,
            quality: 1,
            format: icon.name.replace(/.*\.(\w+)$/i, '$1').toLowerCase(),
            width: icon.size,
            height: icon.size,
        }, function(err, stdout, stderr) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
                display.success(icon.name + ' created');
            }
        });
    } catch (error) {
        deferred.reject(err);
    }
    return deferred.promise;
};

/**
 * Generates icons based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateIconsForPlatform = function(platform) {
    var deferred = Q.defer();
    display.header('Generating Icons for ' + platform.name);
    var all = [];
    var icons = platform.icons;
    icons.forEach(function(icon) {
        all.push(generateIcon(platform, icon));
    });
    Q.all(all).then(function() {
        deferred.resolve();
    }).catch(function(err) {
        console.log(err);
    });
    return deferred.promise;
};

/**
 * Goes over all the platforms and triggers icon generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateIcons = function(platforms) {
    var deferred = Q.defer();
    var sequence = Q();
    var all = [];
    _(platforms).where({
        isAdded: true
    }).forEach(function(platform) {
        sequence = sequence.then(function() {
            return generateIconsForPlatform(platform);
        });
        all.push(sequence);
    });
    Q.all(all).then(function() {
        deferred.resolve();
    });
    return deferred.promise;
};


/**
 * Checks if a valid icon file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validIconExists = function() {
    var deferred = Q.defer();
    fs.exists(settings.ICON_FILE, function(exists) {
        if (exists) {
            display.success(settings.ICON_FILE + ' exists');
            deferred.resolve(true);
        } else {
            display.error(settings.ICON_FILE + ' does not exist in the root folder');
            deferred.resolve(false);
        }
    });
    return deferred.promise;
};


/**
 * Crops and creates a new splash in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} splash
 * @return {Promise}
 */
var generateSplash = function(platform, splash) {
    var deferred = Q.defer();
    try {
        var filePath = path.join(platform.splashPath, splash.name);
        var filedirName = path.dirname(filePath);
        if (!fs.existsSync(filedirName)) {
            nodeFs.mkdirSync(filedirName, '0777', true);
        }
        ig.crop({
            srcPath: settings.SPLASH_FILE,
            dstPath: filePath,
            quality: 1,
            format: splash.name.replace(/.*\.(\w+)$/i, '$1').toLowerCase(),
            width: splash.width,
            height: splash.height,
        }, function(err, stdout, stderr) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
                display.success(splash.name + ' created');
            }
        });
    } catch (error) {
        deferred.reject(err);
    }
    return deferred.promise;
};

/**
 * Generates splash based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateSplashForPlatform = function(platform) {
    var deferred = Q.defer();
    display.header('Generating splash screen for ' + platform.name);
    var all = [];
    var splashes = platform.splash;
    splashes.forEach(function(splash) {
        all.push(generateSplash(platform, splash));
    });
    Q.all(all).then(function() {
        deferred.resolve();
    }).catch(function(err) {
        console.log(err);
    });
    return deferred.promise;
};

/**
 * Goes over all the platforms and triggers splash screen generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateSplashes = function(platforms) {
    var deferred = Q.defer();
    var sequence = Q();
    var all = [];
    _(platforms).where({
        isAdded: true
    }).forEach(function(platform) {
        sequence = sequence.then(function() {
            return generateSplashForPlatform(platform);
        });
        all.push(sequence);
    });
    Q.all(all).then(function() {
        deferred.resolve();
    });
    return deferred.promise;
};
/**
 * Checks if a valid splash file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validSplashExists = function() {
    var deferred = Q.defer();
    fs.exists(settings.SPLASH_FILE, function(exists) {
        if (exists) {
            display.success(settings.SPLASH_FILE + ' exists');
            deferred.resolve(true);
        } else {
            display.error(settings.SPLASH_FILE + ' does not exist in the root folder');
            deferred.resolve(false);
        }
    });
    return deferred.promise;
};


function generate(options) {
    settings = options || settings;
    display.header('Checking Splash & Icon');
    return Q.all([validIconExists(), validSplashExists()])
        .then(function(results) {
            var hasIcon = results[0] === true;
            var hasSplash = results[1] === true;
            var promise;

            if (!hasIcon && !hasSplash) {
                //console.log(arguments);
                promise = Q.reject();
            }

            if (hasIcon) {
                promise = Q.when(promise)
                    .then(getPlatformIcons)
                    .then(generateIcons);
            }

            if (hasSplash) {
                promise = Q.when(promise)
                    .then(getPlatformSplashs)
                    .then(generateSplashes);
            }

            return Q.when(promise);
        })
        .catch(function(err) {
            if (err) {
                console.log(err);
            }
        }).then(function() {
            console.log('');
        });
}

module.exports = {
    generate: generate
};