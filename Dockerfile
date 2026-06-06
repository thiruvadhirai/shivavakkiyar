FROM docker.io/library/ruby:3.1-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    curl

# Set working directory
WORKDIR /srv/jekyll

# Install bundler
RUN gem install bundler

# Copy Gemfile and Gemfile.lock (if exists)
COPY Gemfile Gemfile.lock* ./

# Install gems from Gemfile using bundler
RUN bundle install --deployment --jobs 4 2>&1 | grep -E "(Fetching|Using|Installing|Gem|ERROR)" || true

ENV LISTEN_DIRS=/srv/jekyll/_posts:/srv/jekyll/_includes:/srv/jekyll/assets:/srv/jekyll/panchangam.md

# Expose port
EXPOSE 4000

# Default command - start jekyll
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
