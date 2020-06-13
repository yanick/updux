#!/usr/bin/env perl

use 5.30.0;
use warnings;
use experimental qw/
    signatures
    postderef
/;


use Path::Tiny;
use Path::Tiny::Glob pathglob => { all => 1};
use File::Serialize;
use List::AllUtils qw/ before_incl /;
use List::UtilsBy qw/ partition_by /;

my $api = deserialize_file './temp/updux.api.json';

my @lines = generate_index([$api]);

my $sidebar = path('docs/_sidebar.md');

$sidebar->spew(
    ( before_incl { /!-- API/ } $sidebar->lines ),
    map { "$_\n" } @lines
);

sub generate_index($entries,$indent = 2) {
    my @lines;

    my %sections = partition_by {
        $_->{kind}
    } @$entries;


    for my $type ( sort keys %sections ) {
        my $entries = $sections{$type};

        if ( $type eq 'Constructor' ) {
            push @lines, sprintf "%s- [%s](%s)",
                "  " x $indent, 'Constructor', ref2link(@$entries);
                next;
        }

        push @lines, join '', "  " x $indent, '- ', $type unless $type eq 'EntryPoint';

        for my $entry ( @$entries ) {
            my $i = $indent;

            if( $entry->{name} ){
                my $link = ref2link($entry);

                push @lines, sprintf "%s- [%s](%s)",
                    "  " x (++$i), $entry->{name}, $link;
            }

            my $members = $entry->{members} or next;

            push @lines, generate_index($members, $i+1);
        }
    }

    return @lines;
}

sub ref2link($entry) {
                return "/4-API/".
                lc( $entry->{canonicalReference} =~ s/!|#/./gr
                    =~ s/:constructor/._constructor_/r
                    =~ s/:\w+//r
                    =~ s/\)//r
                    =~ s/\((\d+)/'_' . ($1-1)/er
                    =~ s/_0//r ). '.md'
                    ;
}
