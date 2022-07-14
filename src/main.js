import Vue from 'vue'
import App from './App.vue'

/*
app = new Vue({
  el: '#app',
  render: h => h(App)
})
*/

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function handleError(err) {
  console.error(err);
  const target = app || data;
  target.invoice = '';
  target.status = String(err).replace(/^Error: /, '');
  console.log(data);
}

const data = {
  count: 0,
  invoice: '',
  status: 'waiting',
  tableConnected: false,
  rowConnected: false,
  haveRows: false,
  llData: false,
  scores: false,
  naam: "-"
};
let app = undefined;

ready(function () {
  // Update the invoice anytime the document data changes.
  grist.ready();
  grist.onRecord(updateReport);

  // Monitor status so we can give user advice.
  grist.on('message', msg => {
    // If we are told about a table but not which row to access, check the
    // number of rows.  Currently if the table is empty, and "select by" is
    // not set, onRecord() will never be called.
    if (msg.tableId && !app.rowConnected) {
      grist.docApi.fetchSelectedTable().then(table => {
        if (table.id && table.id.length >= 1) {
          app.haveRows = true;
        }
      }).catch(e => console.log(e));
    }
    if (msg.tableId) { app.tableConnected = true; }
    if (msg.tableId && !msg.dataChange) { app.RowConnected = true; }
  });

  Vue.config.errorHandler = function (err, vm, info) {
    handleError(err);
  };

  /*app = new Vue({
    el: '#app',
    data: data
  });*/
  app = new Vue({
    el: '#app',
    data: data,
    render: h => h(App)
  })

  if (document.location.search.includes('demo')) {
    updateReport(exampleData);
  }
  if (document.location.search.includes('labels')) {
    updateReport({});
  }
  if (!data.haveRows) {
    updateReport(demoData);
  }
});

function updateReport(row) {
  data.llData = row.references;
  document.title = data.llData.naam;
  let rawscores = row.references.scores;
  let categories = [];
  let scores = {};
  rawscores.sort((a, b) => {
    return a.catsort - b.catsort || a.toetssort - b.toetssort || new Date(a.datum) - new Date(b.datum);
  });
  rawscores.forEach((score) => {
    if (!scores.hasOwnProperty(score.categorie_naam)) {
      scores[score.categorie_naam] = [];
    }
    scores[score.categorie_naam].push({
      "toets": score.toets_naam,
      "score": score.score,
      "toets_ds": score.toets_ds,
      "datum": score.datum
    })
  })
  data.scores = scores;







}
