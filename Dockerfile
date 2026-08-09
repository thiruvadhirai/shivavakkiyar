FROM docker.io/library/ruby:3.1-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    curl

# Set working directory
WORKDIR /srv/jekyll

# Install exact gem versions from the lockfile (must match what's bind-mounted
# from the host at runtime, or Bundler refuses to boot Jekyll with a
# Bundler::GemNotFound error) — Gemfile.lock already pins musl-platform builds
RUN gem install bundler
COPY Gemfile Gemfile.lock ./
RUN bundle install

ENV LISTEN_DIRS=/srv/jekyll/_posts:/srv/jekyll/_includes:/srv/jekyll/assets:/srv/jekyll/panchangam.md

# Expose port
EXPOSE 4000

# Default command - start jekyll
CMD ["jekyll", "serve", "--host", "0.0.0.0"]
