# demo.fintar.id: one static Go binary plus public/. Built for linux/arm64
# (the ECS hosts are Graviton) by scripts/deploy.sh.
FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /demo .

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /demo /app/demo
COPY public /app/public
EXPOSE 3300
ENTRYPOINT ["/app/demo"]
