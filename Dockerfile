FROM docker.io/library/ruby:3.1-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    curl

# Set working directory
WORKDIR /srv/jekyll

# Install Jekyll and bundler
RUN gem install jekyll bundler

# Expose port
EXPOSE 4000

# Default command - install webrick and start jekyll
CMD sh -c "gem install webrick && jekyll serve --host 0.0.0.0"
