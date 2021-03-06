'use strict';

// process.env.GH_USER = window.prompt('Enter Github User');
// process.env.GH_PASS = window.prompt('Enter Github Pass');

var m = require('mithril');
//var GitHub = require('github-api');
var contributors = require('./contributors');

var label = {
  'JS': '.label-warning',
  'Java': '.label-danger',
  'Swift': '.label-info'
};

function renderCards(repo) {
  if (!repo) { return; }

  repo.language = repo.language === 'CSS' || repo.language === 'JavaScript' ? 'JS' : repo.language;

  var labelLanguage = label[repo.language] || '.label-default';

  return repo ? m('.card.col-xs-12.col-sm-6.col-md-3.col-lg-3.col-xl-3', [
      m('.card-header.ncss-brand.u-capitalize.h4', [
        m('a', {
          href: repo.html_url,
          target: '_blank'
        }, m('img.card-img-top.card-img-top-project', {
          src: '/dist/img/icons/' + repo.name.toLowerCase() + '_no_txt.svg'
        })),
        m('a', {
            href: repo.html_url,
            target: '_blank'
          }, repo.name.toUpperCase().replace('NIKE-INC.', '')
        ),
        m('span.label.pull-xs-right' + labelLanguage, repo.language)
      ]),
      m('.card-block.card-block-project', [
        m('a', {
            href: repo.html_url,
            target: '_blank'
          }, m('small.card-subtitle.text-muted', repo.full_name)
        ),
        m('p.card-text', repo.description && repo.description.length > 114 ? repo.description.substr(0, 114) + ' ...' : repo.description)
      ]),
      m('.card-block', [
        m('div.card-subtitle', [
          m('div.m-x-auto', {
            style: {
              width: '120px'
            }
          }, [
            m('span.label.label-default.pull-xs-left', 'Forks: ' + repo.forks),
            m.trust('&nbsp;'),
            m('span.label.label-default.pull-xs-right', 'Stars: ' + repo.stargazers_count)
          ])
        ]),
      ]),
      m('.card-footer', [
        m('.pull-xs-left.m-t-1', [
          m('a.btn.bmd-btn-icon.text-muted', {
            href: 'https://www.facebook.com/sharer/sharer.php?u=' + repo.html_url,
            target: '_blank'
            },
            m('i.g72-facebook')
          ),
          m('a.btn.bmd-btn-icon.text-muted', {
            href: 'https://twitter.com/intent/tweet?text=' + repo.html_url,
            target: '_blank'
            },
            m('i.g72-twitter')
          )
        ]),
        m('.pull-xs-right', [
          m('a.btn.btn-primary', {
            href: repo.html_url,
            target: '_blank'
          }, 'REPO')
        ])
      ])
  ]) : '';
}

var repositories = {
  controller: function() {
    var ctrl = this;
    ctrl.repos = repo_metadata.public_repositories || [];
    ctrl.contributors = repo_metadata.organization_members || [];
    //ctrl.contributors = ctrl.contributors.concat(repo_metadata.contributors || []);
    ctrl.repo_metadata = repo_metadata || {};
    ctrl.init = function(el, isInit) {
      if (!isInit) {
        //// using repository metadata for live,
        //// you could uncomment the line below
        //// for local dev or setup jekyll
        //// https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll

        //ctrl.getRepos();
      }
    };
    ctrl.getRepos = function() {
      // var gh = new GitHub({
      //   username: process.env.GH_USER,
      //   password: process.env.GH_PASS
      // });
      var gh = new GitHub();

      var org = gh.getOrganization('nike-inc');

      org.listMembers()
          .then(function(res) {
            var members = res.data;
             ctrl.contributors = members;
             m.redraw(true);
          }).catch(function(err) {
            console.log('catch', err);
          });


      org.getRepos(function(err, repos) {
          ctrl.repos = repos;

          repos.map(function(repo) {
            var remoteRepo = gh.getRepo('nike-inc', repo.name);
            remoteRepo.getContributors(function(err, contributorsWrap) {
                contributorsWrap.map(function(contributor) {
                  ctrl.contributors.push(contributor.author);
                });
              });
          });
          m.redraw(true);
        })
        .catch(function(err) {
          console.log('catch', err);
        });
    };
  },
  view: function(ctrl) {
    return m('div', {
        id: 'content',
        config: ctrl.init
      },
      m('.container', {
          id: 'repos-container'
        },
        m('.row',
          ctrl.repos.map(renderCards)
        )
      ),
      m.component(contributors, {contributors: ctrl.contributors})
    );
  }
};

module.exports = repositories;
