module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: false
      },
      single: {
        singleRun: true
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    ngmin: {
      dist: {
        files: [
          {
            src: 'dist/<%= pkg.name %>.js',
            dest: 'dist/<%= pkg.name %>.js'
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    connect: {
      examples: {
        options: {
          port: 9010,
          keepalive: true,
          middleware: function (connect, options) {
            var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
            console.log(options.base);
            return [
              // Include the proxy first
              proxy,
              // Serve static files.
              connect.static(options.base[0]),
              // Make empty directories browsable.
              connect.directory(options.base[0])
            ];
          }
        },
        proxies: [
          {
            context: ['/relution', '/gofer'],
            host: 'mdmdev4.mwaysolutions.com',
            https: false,
            port: 80,
            changeOrigin: true,
            xforward: false
          }
        ]
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('test:once', ['jshint', 'karma:single']);
  grunt.registerTask('serve', ['configureProxies:examples', 'connect:examples']);
  grunt.registerTask('default', ['jshint', 'karma:single', 'concat', 'ngmin', 'uglify']);

};