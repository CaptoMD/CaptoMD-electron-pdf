# CaptoMD-electron-pdf
Express server wrapper as service for fraserxu/electron-pdf

## Generating a PDF

Will download a PDF:

**[POST]** [http://localhost:9645/](http://localhost:9645/) with body payload (`application/zip`) of a zip file of your main HTML file (index.html) and assets.

Here’s an example:

```
  index.html
  ├─ assets/
  │  ├─ my-styles.css
  │  ├─ fonts.css
  │  ┕─ fonts/
  │     ├─ font-a.woff2
  │     ┕─ font-a.ttf
  ┕─ image.svg
```

The main entry point is **`index.html`** and is required.

## Page customization

The default page size is Letter.

You should set your own page size, margins and orientation. 

Declare them in your CSS file:

```CSS
    @page {
        size: 210mm 297mm;
        margin: 24mm 16mm;
    }

    @page :first {
        size: A4 landscape;
        margin: 50mm 16mm 24mm;
    }
```

## DOM Ready

You must include this javascript in your main HTML file, preferably in the `head` section:

```JS
    <script>
        var eventEmitInterval = setInterval(function () {
            document.body.dispatchEvent(new Event('view-ready'));
        }, 25);

        document.body.addEventListener('view-ready-acknowledged', function () {
            clearInterval(eventEmitInterval);
        });
    </script>
``` 

