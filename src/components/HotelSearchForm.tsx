import { Label } from "@radix-ui/react-label";
import { Controller } from "react-hook-form";
import LocationAutocomplete from "@/components/LocationAutocomplete";

<>
          <Label htmlFor="location">Destination</Label>
          <Controller
            name="locationId"
            control={control}
            render={({ field }) => (
              <LocationAutocomplete
                onLocationSelect={(id, name, lat, lng) => {
                  field.onChange(id);
                  handleLocationSelect(id, name, lat, lng);
                }}
              />
            )}
          />
          {errors.locationId && (
            <p className="text-red-500 text-sm mt-1">{errors.locationId.message}</p>
          )} 
</> 