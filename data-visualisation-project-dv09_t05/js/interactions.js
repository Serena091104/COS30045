
document.addEventListener('DOMContentLoaded', function () {
  var tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  for (var i = 0; i < tooltipElements.length; i++) {
    new bootstrap.Tooltip(tooltipElements[i]);
  }
});

function scrollToStart(){
  document.getElementById("start").scrollIntoView({ behavior: "smooth" });
}