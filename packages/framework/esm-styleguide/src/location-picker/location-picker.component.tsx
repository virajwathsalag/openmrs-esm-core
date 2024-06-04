import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Search, RadioButton, RadioButtonGroup, RadioButtonSkeleton } from '@carbon/react';
import styles from './location-picker.module.scss';
import { useLocationByUuid, useLocations } from './location-picker.resource';

interface LocationPickerProps {
  selectedLocationUuid: string | null;
  onChange: (locationUuid?: string) => void;
  defaultLocationUuid?: string;
  locationTag?: string;
  locationsPerRequest?: number;
}

/**
 * This is a generic location picker component. It fetches locations based on the location tag provided.
 * It uses infinite scroll and includes a searchbar. It is a controlled input, so it expects a
 * selectedLocationUuid and an onChange function to be passed in as props.
 *
 * @param options.selectedLocationUuid - The currently selected location's UUID. If there is no selected location, use null.
 * @param options.onChange - A function that will be called when a location is selected.
 * @param options.defaultLocationUuid - The UUID of the default location to be displayed at the top of the list. The location
 *                                   will be used regardless of whether it has the correct location tag.
 * @param options.locationTag - The location tag to filter locations by.
 * @param options.locationsPerRequest - The number of locations to fetch per request. Default is 50.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocationUuid,
  defaultLocationUuid,
  locationTag,
  locationsPerRequest = 50,
  onChange,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  let defaultLocation = useLocationByUuid(defaultLocationUuid).location;

  const {
    locations: fetchedLocations,
    isLoading,
    hasMore,
    loadingNewData,
    setPage,
  } = useLocations(locationTag, locationsPerRequest, searchTerm);

  const locations = useMemo(() => {
    if (fetchedLocations && defaultLocation && !searchTerm) {
      return [defaultLocation, ...fetchedLocations?.filter(({ resource }) => resource.id !== defaultLocationUuid)];
    }
    return fetchedLocations ?? [];
  }, [defaultLocation, fetchedLocations]);

  const search = (location: string) => {
    onChange();
    setSearchTerm(location);
  };

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingIconRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingNewData) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((page) => page + 1);
          }
        },
        {
          threshold: 1,
        },
      );
      if (node) observer.current.observe(node);
    },
    [loadingNewData, hasMore, setPage],
  );

  const reloadIndex = hasMore ? locations.length - locationsPerRequest / 2 : -1;

  return (
    <div>
      <Search
        autoFocus
        labelText={t('searchForLocation', 'Search for a location')}
        id="search-1"
        placeholder={t('searchForLocation', 'Search for a location')}
        onChange={(event) => search(event.target.value)}
        name="searchForLocation"
        size="lg"
      />
      <div className={styles.searchResults}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
            <RadioButtonSkeleton className={styles.radioButtonSkeleton} role="progressbar" />
          </div>
        ) : (
          <>
            <div className={styles.locationResultsContainer}>
              {locations?.length > 0 ? (
                <RadioButtonGroup
                  valueSelected={selectedLocationUuid}
                  orientation="vertical"
                  name="Login locations"
                  onChange={(ev) => {
                    onChange(ev.toString());
                  }}
                >
                  {locations.map((entry, i) => (
                    <RadioButton
                      className={styles.locationRadioButton}
                      key={entry.resource.id}
                      id={entry.resource.id}
                      name={entry.resource.name}
                      labelText={<span ref={i == reloadIndex ? loadingIconRef : null}>{entry.resource.name}</span>}
                      value={entry.resource.id}
                    />
                  ))}
                </RadioButtonGroup>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.locationNotFound}>{t('noResultsToDisplay', 'No results to display')}</p>
                </div>
              )}
            </div>
            {loadingNewData && (
              <div className={styles.loadingIcon}>
                <InlineLoading description={t('loading', 'Loading')} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
