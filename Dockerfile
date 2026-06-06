FROM docker.io/library/ruby:3.1-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    curl

# Set working directory
WORKDIR /srv/jekyll

# Install Jekyll and bundler directly (not from Gemfile due to sass-embedded issues on Alpine)
RUN gem install jekyll bundler webrick

ENV LISTEN_DIRS=/srv/jekyll/_posts:/srv/jekyll/_includes:/srv/jekyll/assets:/srv/jekyll/panchangam.md

# Expose port
EXPOSE 4000

# Default command - start jekyll
CMD ["jekyll", "serve", "--host", "0.0.0.0"]
