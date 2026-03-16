fetch('/dbq?id=1')
    .then(res => res.json())
    .then(data => console.log(data));