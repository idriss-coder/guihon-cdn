# Guihon CDN

*How to use an api*

path/to/location = httpd://cdn.guihon.cm

## Add image to server

```
 const formData = new FormData()
        formData.append("file", file)
        await axios
          .post(cdnUrlUload, formData, config)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err));
    }

```

## Remove image

```
axios.delete("path/to/location/{imageName}")
```

## Get image

```
axios.delete("path/to/location/{imageName}")
```

### Supported query params

| *quality*    | low  | medium | normal | High |
| -------------- | ---- | ------ | ------ | ---- |
| *compressed* | true |        |        |      |
|                |      |        |        |      |
