var i = 0;
window.expect = function(passed, actual){
  console.log('Test', i, 'passed?', passed, !passed ? actual : '');
  // alert('Test ' + i + ' passed? ' + passed + ' ' + (!passed ? actual : ''));
  i++;  
}
