# ---------- Build ----------
FROM golang:1.22 AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# ---------- Run ----------
FROM gcr.io/distroless/static-debian12
# Trabalhe em /data para o SQLite cair no volume
WORKDIR /data
# Binário em local padrão do PATH e fora do volume
COPY --from=build /src/server /usr/local/bin/server
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/server"]
